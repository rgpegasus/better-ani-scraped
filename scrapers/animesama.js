import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";
import path from 'path';
import { exec as execCallback } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(execCallback);
 

const BASE_URL = "https://anime-sama.fr";
const CATALOGUE_URL = `${BASE_URL}/catalogue`; 

async function ensureChromiumInstalled(customPath) {
  if (customPath) {
    if (fs.existsSync(customPath)) {
      console.log("customPath:", customPath);
      return customPath;
    } else {
      console.log(`The custom path to Chromium is invalid : ${customPath}`);
    }
  }
  const basePath = path.join(
    process.env.HOME || process.env.USERPROFILE,
    '.cache',
    'puppeteer',
    'chrome'
  );
  const chromiumPath = path.join(basePath, 'win64-135.0.7049.95', 'chrome-win64', 'chrome.exe');

  if (!fs.existsSync(chromiumPath)) {
    console.log("📦 Downloading Chromium 135.0.7049.95...");
    await execAsync('npx puppeteer browsers install chrome@135.0.7049.95');
  }

  return chromiumPath;
}

function getHeaders(referer = BASE_URL) {
  return {
    "User-Agent": "Mozilla/5.0",
    "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
    Referer: referer,
  };
}

export async function searchAnime(
  query,
  limit = 10,
  wantedLanguages = ["vostfr", "vf", "vastfr"],
  wantedTypes = ["Anime", "Film"],
  page = null
) {
  const isWanted = (text, list) =>
    list.some(item => text.toLowerCase().includes(item.toLowerCase()));

  const results = [];

  const fetchPage = async (pageNum) => {
    const url =
      pageNum === 1
        ? `${CATALOGUE_URL}/?search=${encodeURIComponent(query)}`
        : `${CATALOGUE_URL}/?search=${encodeURIComponent(query)}&page=${pageNum}`;

    const res = await axios.get(url, { headers: getHeaders(CATALOGUE_URL) });
    const $ = cheerio.load(res.data);

    const containers = $("a.flex.divide-x");

    containers.each((_, el) => {
      if (results.length >= limit) return false;

      const anchor = $(el);
      const link = anchor.attr("href");
      const title = anchor.find("h1").first().text().trim();
      const altRaw = anchor.find("p.text-xs.opacity-40.italic").first().text().trim();
      const cover = anchor.find("img").first().attr("src");

      const tagText = anchor.find("p").filter((_, p) =>
        isWanted($(p).text(), wantedTypes)
      ).first().text();

      const languageText = anchor.find("p").filter((_, p) =>
        isWanted($(p).text(), wantedLanguages)
      ).first().text();

      const altTitles = altRaw
        ? altRaw.split(",").map((t) => t.trim()).filter(Boolean)
        : [];

      const genreRaw = anchor.find("p.text-xs.font-medium.text-gray-300").first().text().trim();
      const genres = genreRaw
        ? genreRaw.split(",").map((g) => g.trim()).filter(Boolean)
        : [];

      if (title && link && tagText && languageText) {
        results.push({
          title,
          altTitles,
          genres,
          url: link.startsWith("http") ? link : `${CATALOGUE_URL}${link}`,
          cover,
        });
      }
    });

    return containers.length > 0;
  };

  if (page) {
    await fetchPage(page);
  } else {
    let currentPage = 1;
    while (await fetchPage(currentPage++) && results.length < limit) {
      await new Promise((res) => setTimeout(res, 300));
    }
  }

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

    // Remove anything inside comments either ("/* */" or "//")
    const uncommentedContent = content
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\/\/.*$/gm, "");

    const matches = [
      ...uncommentedContent.matchAll(/panneauAnime\("([^"]+)", "([^"]+)"\);/g),
    ];

    for (let match of matches) {
      const title = match[1];
      const href = match[2].split("/")[0];
      const fullUrl = `${CATALOGUE_URL}/${animeName}/${href}/${language}`;

      try {
        const check = await axios.head(fullUrl, {
          headers: getHeaders(animeUrl),
        });
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

export async function getEpisodeTitles(seasonUrl, customChromiumPath) {
  let browser;
  try {
    const puppeteer = await import('puppeteer');
    const executablePath = await ensureChromiumInstalled(customChromiumPath);

    browser = await puppeteer.launch({
      headless: true,
      executablePath,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const blocked = ['image', 'stylesheet', 'font', 'media'];
      if (blocked.includes(req.resourceType())) {
        req.abort();
      } else {
        req.continue();
      }
    });

    await page.goto(seasonUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#selectEpisodes');

    const titres = await page.$$eval('#selectEpisodes option', options =>
      options.map(o => o.textContent.trim())
    );

    return titres;

  } catch (error) {
    console.error('Error while retrieving titles :', error);
    return [];
  } finally {
    if (browser) await browser.close();
  }
}

export async function getEmbed(
  seasonUrl,
  hostPriority = ["sendvid", "sibnet", "vidmoly", "oneupload"],
  allHost = false,
  includeInfo = false, 
  customChromiumPath
) {
  const res = await axios.get(seasonUrl, {
    headers: getHeaders(seasonUrl.split("/").slice(0, 5).join("/")),
  });

  const $ = cheerio.load(res.data);

  const seasonTitle = ($('script').toArray()
    .map(s => $(s).html())
    .find(c => c && c.includes('#avOeuvre')) || '')
    .match(/#avOeuvre"\)\.html\("([^"]+)"/)?.[1] || "Saison inconnue";

  const scriptTag = $('script[src*="episodes.js"]').attr("src");
  if (!scriptTag) throw new Error("No episodes script found");

  const scriptUrl = seasonUrl.endsWith("/")
    ? seasonUrl + scriptTag
    : seasonUrl + "/" + scriptTag;

  const episodesJs = await axios
    .get(scriptUrl, { headers: getHeaders(seasonUrl) })
    .then((r) => r.data);

  const matches = [...episodesJs.matchAll(/var\s+(eps\d+)\s*=\s*(\[[^\]]+\])/g)];
  if (!matches.length) throw new Error("No episode arrays found");

  let episodeMatrix = [];
  for (const [, , arrayString] of matches) {
    try {
      const links = eval(arrayString);
      episodeMatrix.push(links);
    } catch (e) {
      console.warn("Could not parse embed array:", e);
    }
  }

  const maxEpisodes = Math.max(...episodeMatrix.map(arr => arr.length));
  const finalEmbeds = [];

  for (let i = 0; i < maxEpisodes; i++) {
    if (allHost) {
      const urls = [];
      const hosts = [];

      for (const host of hostPriority) {
        for (const arr of episodeMatrix) {
          if (i < arr.length && arr[i].includes(host)) {
            if (!hosts.includes(host)) {
              urls.push(arr[i]);
              hosts.push(host);
            }
            break; // une seule URL par host
          }
        }
      }

      finalEmbeds.push({
        title: null, // à remplir plus tard
        url: urls.length ? urls : null,
        host: hosts.length ? hosts : null,
      });

    } else {
      let selectedUrl = null;
      let selectedHost = null;

      for (const host of hostPriority) {
        for (const arr of episodeMatrix) {
          if (i < arr.length && arr[i].includes(host)) {
            selectedUrl = arr[i];
            selectedHost = host;
            break;
          }
        }
        if (selectedUrl) break;
      }

      finalEmbeds.push({
        title: null, // à remplir plus tard
        url: selectedUrl || null,
        host: selectedHost || null,
      });
    }
  }

  const titles = await getEpisodeTitles(seasonUrl, customChromiumPath);
  finalEmbeds.forEach((embed, i) => {
    embed.title = titles[i] || `Episode ${i + 1}`;
  });

  if (includeInfo) {
    return {
      episodes: finalEmbeds,
      animeInfo: {
        seasonTitle,
        episodeCount: maxEpisodes
      }
    };
  } else {
    return finalEmbeds;
  }
}



export async function getAnimeInfo(animeUrl) {
  const res = await axios.get(animeUrl, { headers: getHeaders(CATALOGUE_URL) });
  const $ = cheerio.load(res.data);

  const cover = $("#coverOeuvre").attr("src");
  const title = $("#titreOeuvre").text();
  const altRaw = $("#titreAlter").text();
  const altTitles = altRaw
    ? altRaw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  const genres = $("h2:contains('Genres')")
    .next("a")
    .text()
    .trim()
    .split(",")
    .map((genre) => genre.trim());

  const synopsis = $("h2:contains('Synopsis')").next("p").text().trim();

  return {
    title,
    altTitles,
    cover,
    genres,
    synopsis,
  };
}

export async function getAvailableLanguages(
  seasonUrl,
  wantedLanguages = ["vostfr", "vf", "va", "vkr", "vcn", "vqc", "vf1", "vf2"],
  numberEpisodes = false
) {
  const languageLinks = [];

  // Iterate over each possible language and check if the page exists
  for (let language of wantedLanguages) {
    const languageUrl = seasonUrl.split('/').map((s, i) => i === 6 ? language : s).join('/');
    try {
      const res = await axios.get(languageUrl, {
        headers: getHeaders(CATALOGUE_URL),
      });
      if (res.status === 200) {
        if (numberEpisodes){
          const episodeCount = (await getEmbed(languageUrl)).length;
          languageLinks.push({ language: language.toUpperCase(), episodeCount: episodeCount });
        } else {
          languageLinks.push({ language: language.toUpperCase()});
        }
        
      }
    } catch (error) {
      // If an error occurs (like a 404), we skip that language
      continue;
    }
  }
  return languageLinks;
}

export async function getAllAnime(
  wantedLanguages = ["vostfr", "vf", "vastfr"],
  wantedTypes = ["Anime", "Film"],
  page = null,
  output = "anime_list.json",
  get_seasons = false
) {
  let animeLinks = [];

  const isWanted = (text, list) =>
    list.some(item => text.toLowerCase().includes(item.toLowerCase()));

  const fetchPage = async (pageNum) => {
    const url = pageNum === 1 ? CATALOGUE_URL : `${CATALOGUE_URL}?page=${pageNum}`;
    const res = await axios.get(url, { headers: getHeaders(CATALOGUE_URL) });
    const $ = cheerio.load(res.data);
  
    const containers = $("div.shrink-0.m-3.rounded.border-2");
  
    containers.each((_, el) => {
      const anchor = $(el).find("a");
      const title = anchor.find("h1").text().trim();
      const link = anchor.attr("href");
      const img = anchor.find("img").attr("src");
  
      const paragraphs = anchor.find("p").toArray().map(p => $(p).text().trim());
  
      const altTitles = paragraphs[0] ? paragraphs[0].split(',').map(name => name.trim()) : [];
      const genres = paragraphs[1] ? paragraphs[1].split(',').map(genre => genre.trim()) : [];
      const type = paragraphs[2] ? paragraphs[2].split(',').map(t => t.trim()) : [];
      const language = paragraphs[3] ? paragraphs[3].split(',').map(lang => lang.trim()) : [];
      const filteredTypes = type.filter(t => isWanted(t, wantedTypes));
      const filteredLanguages = language.filter(lang => isWanted(lang, wantedLanguages));
      if (
        title &&
        link &&
        filteredTypes.length > 0 &&
        filteredLanguages.length > 0
      ) {
        const fullUrl = link.startsWith("http") ? link : `${BASE_URL}${link}`;
        animeLinks.push({
          url: fullUrl,
          title,
          altTitles,
          cover: img,
          genres,
          types: filteredTypes,
          languages: filteredLanguages,
        });
      }
    });
  
    return containers.length > 0;
  };
  
  const enrichWithSeasons = async (list) => {
    for (const anime of list) {
      try {
        const seasons = await getSeasons(anime.url);
        anime.seasons = Array.isArray(seasons) ? seasons : [];
      } catch (err) {
        console.warn(`⚠️ Failed to fetch seasons for ${anime.title}: ${err.message}`);
        anime.seasons = [];
      }
      await new Promise(r => setTimeout(r, 300));
    }
  };

  try {
    if (page) {
      await fetchPage(page);
      if (get_seasons) await enrichWithSeasons(animeLinks);
      return animeLinks;
    } else {
      let currentPage = 1;
      while (await fetchPage(currentPage++)) {
        await new Promise(r => setTimeout(r, 300));
      }

      const uniqueLinks = [...new Map(animeLinks.map(item => [item.url, item])).values()];
      if (get_seasons) await enrichWithSeasons(uniqueLinks);

      fs.writeFileSync(output, JSON.stringify(uniqueLinks, null, 2), "utf-8");
      return true;
    }
  } catch (err) {
    console.error("error :", err.message);
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
        (languageFilter === null || languageFilter.map(l => l.toLowerCase()).includes(language.toLowerCase()))
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

export async function getRandomAnime(
  wantedLanguages = ["vostfr", "vf", "vastfr"],
  wantedTypes = ["Anime", "Film"],
  maxAttempts = null,
  attempt = 0
) {
  try {
    const res = await axios.get(
      `${CATALOGUE_URL}/?search=&random=1`,
      { headers: getHeaders(CATALOGUE_URL) }
    );

    const $ = cheerio.load(res.data);
    const isWanted = (text, list) =>
      list.some(item => text.toLowerCase().includes(item.toLowerCase()));

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

    const tagText = anchor.find("p").filter((_, p) =>
      isWanted($(p).text(), wantedTypes)
    ).first().text();

    const languageText = anchor.find("p").filter((_, p) =>
      isWanted($(p).text(), wantedLanguages)
    ).first().text();

    if (title && link && tagText && languageText) {
      return {
        title,
        altTitles,
        genres,
        url: link.startsWith("http") ? link : `${CATALOGUE_URL}${link}`,
        cover,
      };
    } else {
      if (maxAttempts === null || attempt < maxAttempts) {
        return await getRandomAnime(wantedLanguages, wantedTypes, maxAttempts, attempt + 1);
      } else {
        throw new Error("Max attempts reached without finding a valid anime.");
      }
    }
  } catch (err) {
    console.error("Failed to fetch random anime:", err.message);
    return null;
  }
}

