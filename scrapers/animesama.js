import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";

const BASE_URL = "https://anime-sama.fr";
const CATALOGUE_URL = `${BASE_URL}/catalogue`;

export async function searchAnime(query, limit = 10) {
  // Maximum limit is 48
  const url = `${CATALOGUE_URL}/?type%5B%5D=Anime&search=${encodeURIComponent(
    query
  )}`;
  const res = await axios.get(url);
  const $ = cheerio.load(res.data);
  const results = {};

  $("a.flex.divide-x").each((i, el) => {
    if (i >= limit) return false;

    const link = $(el).attr("href");
    console.log(link);
    const title = $(el).find("h1").first().text().trim();

    if (title && link) {
      results[title] = link.startsWith("http")
        ? link
        : `${CATALOGUE_URL}${link}`;
    }
  });

  return results;
}

export async function getSeasons(animeUrl, language = "vostfr") {
  const res = await axios.get(animeUrl);
  const $ = cheerio.load(res.data);
  const scriptTags = $("script")
    .toArray()
    .filter((script) => {
      return $(script).html().includes("panneauAnime");
    });

  const animeName = animeUrl.split("/")[4];
  const seasons = [];
  let languageAvailable = false;

  for (let script of scriptTags) {
    const content = $(script).html();

    // Remove anything inside comments (between /* and */)
    const uncommentedContent = content.replace(/\/\*[\s\S]*?\*\//g, "");

    const matches = [
      ...uncommentedContent.matchAll(/panneauAnime\("([^"]+)", "([^"]+)"\);/g),
    ];

    for (let match of matches) {
      const name = match[1];
      const href = match[2].split("/")[0];
      const fullUrl = `${CATALOGUE_URL}/${animeName}/${href}/${language}`;

      try {
        // Check if this language version exists
        const check = await axios.head(fullUrl);
        if (check.status === 200) {
          languageAvailable = true;
          seasons.push({ name, url: fullUrl });
        }
      } catch (err) {
        // Ignore 404s or connection issues
      }
    }
  }

  if (!languageAvailable) {
    return { error: `Language "${language}" is not available for this anime.` };
  }

  return seasons;
}


export async function getEmbed(animeUrl, hostPriority = ["sibnet", "vidmoly"]) {
  const res = await axios.get(animeUrl);
  const $ = cheerio.load(res.data);

  // Find the script that contains episode URLs
  const scriptTag = $('script[src*="episodes.js"]').attr("src");
  if (!scriptTag) throw new Error("No episodes script found");

  const scriptUrl = animeUrl.endsWith("/")
    ? animeUrl + scriptTag
    : animeUrl + "/" + scriptTag;

  const episodesJs = await axios.get(scriptUrl).then((r) => r.data);

  // Match all "var epsX = [ ... ]" arrays
  const matches = [
    ...episodesJs.matchAll(/var\s+(eps\d+)\s*=\s*(\[[^\]]+\])/g),
  ];
  if (!matches.length) throw new Error("No episode arrays found");

  let allEmbeds = [];

  for (const [, , arrayString] of matches) {
    try {
      const links = eval(arrayString); // we assume trusted source
      allEmbeds.push(...links);
    } catch (e) {
      console.warn("Could not parse embed array:", e);
    }
  }

  // Sort embeds by host
  for (const host of hostPriority) {
    const filtered = allEmbeds.filter((url) => url.includes(host));
    if (filtered.length) {
      return filtered;
    }
  }

  // If no preferred host is found, return whatever's left
  return allEmbeds;
}

export async function getAnimeInfo(animeUrl) {
  const res = await axios.get(animeUrl);
  const $ = cheerio.load(res.data);

  const cover = $("#coverOeuvre").attr("src");

  const genres = $("h2:contains('Genres')")
    .next("a")
    .text()
    .trim()
    .split(",")
    .map((genre) => genre.trim());

  const synopsis = $("h2:contains('Synopsis')").next("p").text().trim();

  return {
    cover,
    genres,
    synopsis,
  };
}

export async function getAvailableLanguages(animeUrl) {
  const possibleLanguages = ["vf", "va", "vkr", "vcn", "vqc", "vf1", "vf2"];

  const languageLinks = ["VOSTFR"];

  // Iterate over each possible language and check if the page exists
  for (let language of possibleLanguages) {
    const seasonUrl = Object.values(await getSeasons(animeUrl))[0].url;
    const languageUrl = seasonUrl.replace("vostfr", `${language}`);
    try {
      const res = await axios.get(languageUrl);
      if (res.status === 200) {
        languageLinks.push(language.toUpperCase());
      }
    } catch (error) {
      // If an error occurs (like a 404), we skip that language
      continue;
    }
  }

  return languageLinks;
}

export async function getAllAnime(output = "anime_list.json", get_seasons = false) { // BE CAREFUL, GET_SEASONS TAKES A VERY VERY LONG TIME TO FINISH
  let animeLinks = [];
  let page = 1;

  try {
    while (true) {
      const url = page === 1 ? CATALOGUE_URL : `${CATALOGUE_URL}?page=${page}`;
      const res = await axios.get(url);
      const $ = cheerio.load(res.data);

      const containers = $("div.shrink-0.m-3.rounded.border-2");

      if (containers.length === 0) {
        // console.log("No more anime found, stopping.");
        break;
      }

      containers.each((_, el) => {
        const anchor = $(el).find("a");
        const title = anchor.find("h1").text().trim();
        const link = anchor.attr("href");

        const tagText = anchor
          .find("p")
          .filter((_, p) => $(p).text().includes("Anime"))
          .first()
          .text();

        if (title && link && tagText.includes("Anime")) {
          const fullUrl = link.startsWith("http") ? link : `${BASE_URL}${link}`;
          animeLinks.push({ name: title, url: fullUrl });
        }
      });

      page++;
      await new Promise((r) => setTimeout(r, 300));
    }

    // Deduplicate
    const uniqueLinks = animeLinks.filter(
      (item, index, self) => index === self.findIndex((i) => i.url === item.url)
    );

    if (get_seasons) {
      // console.log("Fetching seasons for each anime...");
      for (let anime of uniqueLinks) {
        try {
          const seasons = await getSeasons(anime.url);
          anime.seasons = Array.isArray(seasons) ? seasons : [];
        } catch (err) {
          console.warn(`⚠️ Failed to fetch seasons for ${anime.name}: ${err.message}`);
          anime.seasons = [];
        }

        // Optional delay to avoid rate-limiting
        await new Promise((r) => setTimeout(r, 300));
      }
    }

    fs.writeFileSync(output, JSON.stringify(uniqueLinks, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("❌ Error occurred:", err.message);
    return false;
  }
}

export async function getLatestEpisodes(languageFilter = null) {
  try {
    const res = await axios.get(BASE_URL);
    const $ = cheerio.load(res.data);

    const container = $("#containerAjoutsAnimes");
    const episodes = [];

    container.find("a").each((_, el) => {
      const link = $(el).attr("href");
      const title = $(el).find("h1").text().trim();
      const cover = $(el).find("img").attr("src");

      const buttons = $(el).find("button");
      const language = $(buttons[0]).text().trim().toLowerCase(); // Normalisation
      const episode = $(buttons[1]).text().trim();

      if (
        title &&
        link &&
        cover &&
        language &&
        episode &&
        (languageFilter === null || language === languageFilter.toLowerCase())
      ) {
        episodes.push({
          name: title,
          url: link,
          cover,
          language,
          episode,
        });
      }
    });

    return episodes;
  } catch (err) {
    console.error("❌ Failed to fetch today episodes:", err.message);
    return [];
  }
}