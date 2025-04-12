import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";

const BASE_URL = "https://anime-sama.fr";
const CATALOGUE_URL = `${BASE_URL}/catalogue`;

function getHeaders(referer = BASE_URL) {
  return {
    'User-Agent': 'Mozilla/5.0',
    'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
    'Referer': referer,
  };
}

export async function searchAnime(query, limit = 10) {
  const url = `${CATALOGUE_URL}/?type%5B%5D=Anime&search=${encodeURIComponent(
    query
  )}`;
  const res = await axios.get(url, { headers: getHeaders(CATALOGUE_URL) });
  const $ = cheerio.load(res.data);
  const results = [];

  $("a.flex.divide-x").each((i, el) => {
    if (i >= limit) return false;

    const anchor = $(el);
    const link = anchor.attr("href");
    const name = anchor.find("h1").first().text().trim();
    const altRaw = anchor
      .find("p.text-xs.opacity-40.italic")
      .first()
      .text()
      .trim();
    const cover = anchor.find("img").first().attr("src");

    const altTitles = altRaw
      ? altRaw
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    const genreRaw = anchor
      .find("p.text-xs.font-medium.text-gray-300")
      .first()
      .text()
      .trim();
    const genres = genreRaw
      ? genreRaw
          .split(",")
          .map((g) => g.trim())
          .filter(Boolean)
      : [];

    if (name && link) {
      results.push({
        name,
        altTitles,
        genres,
        url: link.startsWith("http") ? link : `${CATALOGUE_URL}${link}`,
        cover,
      });
    }
  });

  return results;
}

export async function getSeasons(animeUrl, language = "vostfr") {
  const res = await axios.get(animeUrl, { headers: getHeaders(CATALOGUE_URL) });
  const html = res.data;

  // Only keep the part before the Kai section
  const mainAnimeOnly = html.split("Anime Version Kai")[0];

  const $ = cheerio.load(mainAnimeOnly);
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

    // Remove anything inside comments (/* ... */)
    const uncommentedContent = content.replace(/\/\*[\s\S]*?\*\//g, "");

    const matches = [
      ...uncommentedContent.matchAll(/panneauAnime\("([^"]+)", "([^"]+)"\);/g),
    ];

    for (let match of matches) {
      const title = match[1];
      const href = match[2].split("/")[0];
      const fullUrl = `${CATALOGUE_URL}/${animeName}/${href}/${language}`;

      try {
        const check = await axios.head(fullUrl, { headers: getHeaders(animeUrl) });
        if (check.status === 200) {
          languageAvailable = true;
          seasons.push({ title, url: fullUrl });
        }
      } catch (err) {
        // Ignore missing URLs
      }
    }
  }

  if (!languageAvailable) {
    return { error: `Language "${language}" is not available for this anime.` };
  }

  return seasons;
}

export async function getEmbed(animeUrl, hostPriority = ["sibnet", "vidmoly"]) {
  const res = await axios.get(animeUrl, { headers: getHeaders(animeUrl.split('/').slice(0, 5).join('/')) });
  const $ = cheerio.load(res.data);

  // Find the script that contains episode URLs
  const scriptTag = $('script[src*="episodes.js"]').attr("src");
  if (!scriptTag) throw new Error("No episodes script found");

  const scriptUrl = animeUrl.endsWith("/")
    ? animeUrl + scriptTag
    : animeUrl + "/" + scriptTag;

  const episodesJs = await axios.get(scriptUrl, { headers: getHeaders(animeUrl) }).then((r) => r.data);

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
  const res = await axios.get(animeUrl, { headers: getHeaders(CATALOGUE_URL) });
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

export async function getAvailableLanguages(animeUrl, wantedLanguages = ["vf", "va", "vkr", "vcn", "vqc"]) {
  const languageLinks = ["VOSTFR"];

  // Iterate over each possible language and check if the page exists
  for (let language of wantedLanguages) {
    const seasonUrl = Object.values(await getSeasons(animeUrl))[0].url;
    const languageUrl = seasonUrl.replace("vostfr", `${language}`);
    try {
      const res = await axios.get(languageUrl, { headers: getHeaders(CATALOGUE_URL) });
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

export async function getAllAnime(
  output = "anime_list.json",
  get_seasons = false
) {
  // BE CAREFUL, GET_SEASONS TAKES A VERY VERY LONG TIME TO FINISH
  let animeLinks = [];
  let page = 1;

  try {
    while (true) {
      const url = page === 1 ? CATALOGUE_URL : `${CATALOGUE_URL}?page=${page}`;
      const res = await axios.get(url, { headers: getHeaders(CATALOGUE_URL) });
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
          animeLinks.push({ title: title, url: fullUrl });
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
          console.warn(
            `⚠️ Failed to fetch seasons for ${anime.name}: ${err.message}`
          );
          anime.seasons = [];
        }

        // Optional delay to avoid rate-limiting
        await new Promise((r) => setTimeout(r, 300));
      }
    }

    fs.writeFileSync(output, JSON.stringify(uniqueLinks, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error occurred:", err.message);
    return false;
  }
}

export async function getLatestEpisodes(languageFilter = null) {
  try {
    const res = await axios.get(BASE_URL, { headers: getHeaders() });
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
          title: title,
          url: link,
          cover,
          language,
          episode,
        });
      }
    });

    return episodes;
  } catch (err) {
    console.error("Failed to fetch today episodes:", err.message);
    return [];
  }
}

export async function getRandomAnime() {
  try {
    const res = await axios.get(
      `${CATALOGUE_URL}/?type[]=Anime&search=&random=1`, { headers: getHeaders(CATALOGUE_URL) }
    );
    const $ = cheerio.load(res.data);

    const container = $("div.shrink-0.m-3.rounded.border-2").first();
    const anchor = container.find("a");
    const link = anchor.attr("href");
    const title = anchor.find("h1").first().text().trim();
    const altRaw = anchor
      .find("p.text-xs.opacity-40.italic")
      .first()
      .text()
      .trim();
    const cover = anchor.find("img").first().attr("src");

    const altTitles = altRaw
      ? altRaw
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    const genreRaw = anchor
      .find("p.text-xs.font-medium.text-gray-300")
      .first()
      .text()
      .trim();
    const genres = genreRaw
      ? genreRaw
          .split(",")
          .map((g) => g.trim())
          .filter(Boolean)
      : [];

    if (title && link) {
      return {
        title,
        altTitles,
        genres,
        url: link.startsWith("http") ? link : `${CATALOGUE_URL}${link}`,
        cover,
      };
    } else {
      throw new Error("No anime found in random response.");
    }
  } catch (err) {
    console.error("Failed to fetch random anime:", err.message);
    return null;
  }
}
