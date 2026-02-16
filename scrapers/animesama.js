import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import { exec as execCallback } from "child_process";
import puppeteerExtra from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { URL } from "url";

const execAsync = promisify(execCallback);
puppeteerExtra.use(StealthPlugin());

const LIST_URL = "https://anime-sama.pw";

export async function getWorkingUrl(listUrl = LIST_URL) {
  const res = await axios.get(listUrl);
  const $ = cheerio.load(res.data);
  const btn = $(".btn-primary").attr("href");
  if (!btn) return null;
  let href = new URL(btn, listUrl).href;
  if (href.endsWith("/")) {
    href = href.slice(0, -1);
  }

  try {
    await axios.get(href, {
      maxRedirects: 0,
      responseType: "stream",
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });
  } catch (err) {
    const response = err.response;
    if (response?.status === 302) {
      let location = response.headers.location;
      let redirectedUrl = new URL(location, href).href;
      if (redirectedUrl.endsWith("/")) {
        redirectedUrl = redirectedUrl.slice(0, -1);
      }
      return redirectedUrl;
    }
    throw err;
  }
  return href;
}

let BASE_URL;
let CATALOGUE_URL;

async function init() {
  BASE_URL = await getWorkingUrl();
  CATALOGUE_URL = `${BASE_URL}/catalogue`;
}

function getHeaders(referer = BASE_URL) {
  return {
    "User-Agent": "Mozilla/5.0",
    "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
    Referer: referer,
  };
}
function isWanted(text, list) {
  return (
    list.length === 0 ||
    list.some((item) => text.toLowerCase().includes(item.toLowerCase()))
  );
}

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
    ".cache",
    "puppeteer",
    "chrome",
  );
  const chromiumPath = path.join(
    basePath,
    "win64-135.0.7049.95",
    "chrome-win64",
    "chrome.exe",
  );

  if (!fs.existsSync(chromiumPath)) {
    console.log("📦 Downloading Chromium 135.0.7049.95...");
    await execAsync("npx puppeteer browsers install chrome@135.0.7049.95");
  }

  return chromiumPath;
}
let allAvailableLanguages = [
  "vostfr",
  "vf",
  "va",
  "vkr",
  "vcn",
  "vqc",
  "vf1",
  "vf2",
];
let mainAvailableLanguages = ["vostfr", "vf", "vastfr"];
let allAvailableTypes = ["Anime", "Film", "Scans", "Autres"];

export async function searchAnime(
  query,
  limit = 10,
  wantedLanguages = mainAvailableLanguages,
  wantedTypes = allAvailableTypes,
  wantedPage = 1,
) {
  await init();
  const results = [];
  const fetchHtml = async (url) => {
    const res = await axios.get(url, { headers: getHeaders(CATALOGUE_URL) });
    return res.data;
  };
  const fetchPage = async (pageNum) => {
    const searchUrl =
      pageNum === 1
        ? `${CATALOGUE_URL}/?search=${encodeURIComponent(query)}`
        : `${CATALOGUE_URL}/?search=${encodeURIComponent(query)}&page=${pageNum}`;
    const html = await fetchHtml(searchUrl);
    const $ = cheerio.load(html);
    const containers = $("div.catalog-card > a");

    containers.each((_, el) => {
      if (results.length >= limit) return false;

      const anchor = $(el);
      const url = anchor.attr("href");
      const title = anchor.find("h2").first().text().trim();
      const altRaw = anchor.find("p").first().text().trim();
      const genreRaw = anchor.find("p.info-value").first().text().trim();
      const cover = anchor.find("img").first().attr("src");
      const synopsis = anchor
        .find("div.synopsis-content")
        .first()
        .text()
        .trim();

      const altTitles = altRaw
        ? altRaw
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [];
      const genres = genreRaw?.includes(",")
        ? genreRaw
            .split(",")
            .map((g) => g.trim())
            .filter(Boolean)
        : genreRaw?.includes("-")
          ? genreRaw
              .split("-")
              .map((g) => g.trim())
              .filter(Boolean)
          : [];
      const typesRaw = anchor
        .find(".info-row")
        .filter(
          (_, row) =>
            $(row).find(".info-label").text().trim().toLowerCase() === "types",
        )
        .find(".info-value")
        .text()
        .split(/[,/-]/)
        .map((t) => t.trim())
        .filter(Boolean);

      let filteredTypes =
        wantedTypes.length === 0
          ? typesRaw
          : wantedTypes.filter((type) => isWanted(type, typesRaw));
      const hasScans = filteredTypes.some((t) => t.toLowerCase() === "scans");
      const languagesRaw = anchor
        .find(".info-row")
        .filter(
          (_, row) =>
            $(row).find(".info-label").text().trim().toLowerCase() ===
            "langues",
        )
        .find(".info-value")
        .text()
        .toLowerCase()
        .split(/[,/-]/)
        .map((t) => t.trim())
        .filter(Boolean);
      let filteredLanguages =
        wantedLanguages.length === 0
          ? languagesRaw
          : wantedLanguages.filter((lang) => isWanted(lang, languagesRaw));
      if (
        title &&
        url &&
        filteredTypes.length > 0 &&
        (filteredLanguages.length > 0 || hasScans)
      ) {
        results.push({
          url: url.startsWith(CATALOGUE_URL)
            ? url
            : url.startsWith("/catalogue")
              ? `${BASE_URL}${url}`
              : `${CATALOGUE_URL}${url}`,
          title,
          altTitles,
          cover,
          synopsis,
          genres,
          types: filteredTypes,
          languages: filteredLanguages,
        });
      }
    });
    return containers.length > 0;
  };

  if (wantedPage) {
    await fetchPage(wantedPage);
  } else {
    let currentPage = 1;
    while ((await fetchPage(currentPage++)) && results.length < limit) {
      await new Promise((res) => setTimeout(res, 300));
    }
  }

  return results;
}

export async function getSeasons(
  animeUrl,
  wantedLanguages = allAvailableLanguages,
  wantedTypes = ["Anime", "Kai", "Scans"],
) {
  await init();
  const res = await axios.get(animeUrl, { headers: getHeaders(CATALOGUE_URL) });
  const html = res.data.replace(/<!--[\s\S]*?-->/g, "");
  const mainAnimeOnly = {};

  if (wantedTypes.includes("Anime") || wantedTypes.length === 0) {
    mainAnimeOnly.anime =
      html.match(/<h2[^>]*>\s*Anime\s*<\/h2>[\s\S]*?(?=<h2|$)/gi) || [];
  }
  if (wantedTypes.includes("Kai") || wantedTypes.length === 0) {
    mainAnimeOnly.kai =
      html.match(/<h2[^>]*>\s*[^<]*Kai\b[\s\S]*?(?=<h2|$)/gi) || [];
  }
  if (wantedTypes.includes("Scans") || wantedTypes.length === 0) {
    mainAnimeOnly.scans =
      html.match(/<h2[^>]*>\s*Manga\s*<\/h2>[\s\S]*?(?=<h2|$)/gi) || [];
  }

  const animeId = animeUrl.split("/")[4];
  let seasons = [];
  for (const [typeKey, sections] of Object.entries(mainAnimeOnly)) {
    for (const sectionHtml of sections) {
      const $ = cheerio.load(sectionHtml);
      const scriptTags = $("script")
        .toArray()
        .filter((script) =>
          ["panneauAnime", "panneauScan"].some((str) =>
            $(script).html().includes(str),
          ),
        );

      for (const script of scriptTags) {
        const content = $(script).html();
        const uncommentedContent = content
          .replace(/\/\*[\s\S]*?\*\//g, "")
          .replace(/\/\/.*$/gm, "");

        const matches = [
          ...uncommentedContent.matchAll(
            /(panneauAnime|panneauScan)\("([^"]+)", "([^"]+)"\);/g,
          ),
        ];

        for (let match of matches) {
          const title = match[2];
          const seasonId = match[3].split("/")[0];
          for (const lang of wantedLanguages.length
            ? wantedLanguages
            : allAvailableLanguages) {
            const fullUrl = `${CATALOGUE_URL}/${animeId}/${seasonId}/${lang}`;
            try {
              const check = await axios.head(fullUrl, {
                headers: getHeaders(animeUrl),
              });
              if (check.status === 200) {
                if (title) {
                  seasons.push({
                    title,
                    url: fullUrl,
                    language: lang,
                    type: typeKey?.[0].toUpperCase() + typeKey?.substring(1),
                  });
                }
                break;
              }
            } catch {}
          }
        }
      }
    }
  }
  return seasons;
}

export async function getEpisodeTitles(seasonUrl, customChromiumPath) {
  let browser;
  try {
    const puppeteer = await import("puppeteer");
    const executablePath = await ensureChromiumInstalled(customChromiumPath);

    browser = await puppeteer.launch({
      headless: true,
      executablePath,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setExtraHTTPHeaders(getHeaders(seasonUrl));
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const blocked = ["image", "stylesheet", "font", "media"];
      if (blocked.includes(req.resourceType())) {
        req.abort();
      } else {
        req.continue();
      }
    });
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    );
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => false });
    });
    await page.goto(seasonUrl, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("#selectEpisodes");

    const titres = await page.$$eval("#selectEpisodes option", (options) =>
      options.map((o) => o.textContent.trim()),
    );

    return titres;
  } catch (error) {
    console.error("Error while retrieving titles :", error);
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
  customChromiumPath,
) {
  const res = await axios.get(seasonUrl, {
    headers: getHeaders(seasonUrl.split("/").slice(0, 5).join("/")),
  });

  const $ = cheerio.load(res.data);

  const seasonTitle =
    (
      $("script")
        .toArray()
        .map((s) => $(s).html())
        .find((c) => c && c.includes("#avOeuvre")) || ""
    ).match(/#avOeuvre"\)\.html\("([^"]+)"/)?.[1] || "Saison inconnue";

  const scriptTag = $('script[src*="episodes.js"]').attr("src");
  if (!scriptTag) throw new Error("No episodes script found");

  const scriptUrl = seasonUrl.endsWith("/")
    ? seasonUrl + scriptTag
    : seasonUrl + "/" + scriptTag;

  const episodesJs = await axios
    .get(scriptUrl, { headers: getHeaders(seasonUrl) })
    .then((r) => r.data);

  const matches = [
    ...episodesJs.toLowerCase().matchAll(/var\s+(eps\d+)\s*=\s*(\[[^\]]+\])/g),
  ];
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
  const titles = await getEpisodeTitles(seasonUrl, customChromiumPath);
  const maxEpisodes =
    titles.length || Math.max(...episodeMatrix.map((arr) => arr.length));
  const finalEmbeds = [];

  for (let i = 0; i < maxEpisodes; i++) {
    if (allHost) {
      const urls = [];
      const hosts = [];

      for (const host of hostPriority) {
        for (const arr of episodeMatrix) {
          if (i < arr.length && arr[i].includes(host.toLowerCase())) {
            if (arr[i].includes("vidmoly.to/")) {
              arr[i] = arr[i].replace("vidmoly.to/", "vidmoly.biz/");
            }
            if (!hosts.includes(host.toLowerCase())) {
              urls.push(arr[i]);
              hosts.push(host.toLowerCase());
            }
            break;
          }
        }
      }
      if (urls.length > 0 && hosts.length > 0) {
        finalEmbeds.push({
          title: null,
          url: urls,
          host: hosts,
        });
      }
    } else {
      let selectedUrl = null;
      let selectedHost = null;

      for (const host of hostPriority) {
        for (const arr of episodeMatrix) {
          if (i < arr.length && arr[i].includes(host.toLowerCase())) {
            selectedUrl = arr[i];
            selectedHost = host.toLowerCase();
            break;
          }
        }
        if (selectedUrl) break;
      }
      if (selectedUrl.includes("vidmoly.to/")) {
        selectedUrl = selectedUrl.replace("vidmoly.to/", "vidmoly.biz/");
      }
      if (selectedHost) {
        finalEmbeds.push({
          title: null,
          url: selectedUrl,
          host: selectedHost,
        });
      }
    }
  }

  finalEmbeds.forEach((embed, i) => {
    embed.title = titles[i] || `Episode ${i + 1}`;
  });

  if (includeInfo) {
    return {
      episodes: finalEmbeds,
      animeInfo: {
        seasonTitle,
        episodeCount: maxEpisodes,
      },
    };
  } else {
    return finalEmbeds;
  }
}

export async function getAnimeInfo(animeUrl) {
  await init();
  const res = await axios.get(animeUrl, { headers: getHeaders(CATALOGUE_URL) });
  const $ = cheerio.load(res.data);

  const cover = $("#coverOeuvre").attr("src");
  const title = $("#titreOeuvre").text();
  const altRaw = $("#titreAlter").text();
  const altTitles = altRaw?.includes(",")
    ? altRaw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : altRaw?.includes("/")
      ? altRaw
          .split("/")
          .map((t) => t.trim())
          .filter(Boolean)
      : altRaw ? 
      altRaw.split("-")
            .map((t) => t.trim())
            .filter(Boolean)
        : [];

  const genresRaw = $("h2:contains('Genres')")
    .next("a")
    .text()
    .trim()
  let genres;
  if (genresRaw.includes(",")) {
    genres = genresRaw.split(",").map((genre) => genre.trim());
  } else if (genresRaw.includes("/")) {
    genres = genresRaw.split("-").map((genre) => genre.trim());
  } else if (genresRaw.includes("-")) {
    genres = genresRaw.split("/").map((genre) => genre.trim());
  }
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
  wantedLanguages = allAvailableLanguages,
  includeNumberEpisodes = false,
  customChromiumPath,
) {
  await init();
  const languageLinks = [];

  for (let language of wantedLanguages.length
    ? wantedLanguages
    : allAvailableLanguages) {
    const languageUrl = seasonUrl
      .split("/")
      .map((s, i) => (i === 6 ? language : s))
      .join("/");
    try {
      const res = await axios.get(languageUrl, {
        headers: getHeaders(CATALOGUE_URL),
      });
      if (res.status === 200) {
        if (includeNumberEpisodes) {
          const episodeCount = (
            await getEpisodeTitles(languageUrl, customChromiumPath)
          ).length;
          languageLinks.push({
            language: language.toUpperCase(),
            episodeCount: episodeCount,
          });
        } else {
          languageLinks.push(language.toUpperCase());
        }
      }
    } catch (error) {
      continue;
    }
  }
  return languageLinks;
}

export async function getAllAnime(
  wantedLanguages = mainAvailableLanguages,
  wantedTypes = allAvailableTypes,
  wantedPage = null,
  includeSeasons = false,
  output = "anime_list.json",
) {
  await init();
  let animeLinks = [];

  const fetchPage = async (pageNum) => {
    const url =
      pageNum === 1 ? CATALOGUE_URL : `${CATALOGUE_URL}?page=${pageNum}`;
    const res = await axios.get(url, { headers: getHeaders(CATALOGUE_URL) });
    const $ = cheerio.load(res.data);

    const containers = $("div.catalog-card > a");

    containers.each((_, el) => {
      const anchor = $(el);
      const url = anchor.attr("href");
      const title = anchor.find("h2").first().text().trim();
      const altRaw = anchor.find("p").first().text().trim();
      const genreRaw = anchor.find("p.info-value").first().text().trim();
      const cover = anchor.find("img").first().attr("src");
      const synopsis = anchor
        .find("div.synopsis-content")
        .first()
        .text()
        .trim();

      const altTitles = altRaw
        ? altRaw
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [];
      const genres = genreRaw?.includes(",")
        ? genreRaw
            .split(",")
            .map((g) => g.trim())
            .filter(Boolean)
        : genreRaw?.includes("-")
          ? genreRaw
              .split("-")
              .map((g) => g.trim())
              .filter(Boolean)
          : [];
      const typesRaw = anchor
        .find(".info-row")
        .filter(
          (_, row) =>
            $(row).find(".info-label").text().trim().toLowerCase() === "types",
        )
        .find(".info-value")
        .text()
        .split(/[,/-]/)
        .map((t) => t.trim())
        .filter(Boolean);

      let filteredTypes =
        wantedTypes.length === 0
          ? typesRaw
          : wantedTypes.filter((type) => isWanted(type, typesRaw));
      const hasScans = filteredTypes.some((t) => t.toLowerCase() === "scans");
      const languagesRaw = anchor
        .find(".info-row")
        .filter(
          (_, row) =>
            $(row).find(".info-label").text().trim().toLowerCase() ===
            "langues",
        )
        .find(".info-value")
        .text()
        .toLowerCase()
        .split(/[,/-]/)
        .map((t) => t.trim())
        .filter(Boolean);
      let filteredLanguages =
        wantedLanguages.length === 0
          ? languagesRaw
          : wantedLanguages.filter((lang) => isWanted(lang, languagesRaw));
      if (
        title &&
        url &&
        filteredTypes.length > 0 &&
        (filteredLanguages.length > 0 || hasScans)
      ) {
        animeLinks.push({
          url: url.startsWith(CATALOGUE_URL)
            ? url
            : url.startsWith("/catalogue")
              ? `${BASE_URL}${url}`
              : `${CATALOGUE_URL}${url}`,
          title,
          altTitles,
          cover,
          synopsis,
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
        const seasons = await getSeasons(
          anime.url,
          wantedLanguages,
          wantedTypes,
        );
        anime.seasons = Array.isArray(seasons) ? seasons : [];
      } catch (err) {
        console.warn(
          `⚠️ Failed to fetch seasons for ${anime.title}: ${err.message}`,
        );
        anime.seasons = [];
      }
      await new Promise((r) => setTimeout(r, 300));
    }
  };

  try {
    if (wantedPage > 0) {
      await fetchPage(wantedPage);
      if (includeSeasons) await enrichWithSeasons(animeLinks);
      return animeLinks;
    } else {
      let currentPage = 1;
      while (await fetchPage(currentPage++)) {
        await new Promise((r) => setTimeout(r, 300));
      }

      const uniqueLinks = [
        ...new Map(animeLinks.map((item) => [item.url, item])).values(),
      ];
      if (includeSeasons) await enrichWithSeasons(uniqueLinks);

      fs.writeFileSync(output, JSON.stringify(uniqueLinks, null, 2), "utf-8");
      return true;
    }
  } catch (err) {
    console.error("error :", err.message);
    return false;
  }
}

export async function getLatestEpisodes(
  wantedLanguages = allAvailableLanguages,
) {
  try {
    await init();
    const res = await axios.get(BASE_URL, { headers: getHeaders() });
    const $ = cheerio.load(res.data);

    const container = $("#containerAjoutsAnimes");
    const episodes = [];

    container.find("a").each((_, el) => {
      const anchor = $(el);
      let url = anchor.attr("href");
      url = url.startsWith(CATALOGUE_URL)
        ? url
        : url.startsWith("/catalogue")
          ? `${BASE_URL}${url}`
          : `${CATALOGUE_URL}${url}`;
      const title = anchor.find("h2").text().trim();
      const cover = anchor.find("img").attr("src");
      const language = url.split("/").slice(6, 7).join("");
      const episode = anchor.find(".info-text").text().trim();
      if (
        title &&
        url &&
        cover &&
        language &&
        episode &&
        (wantedLanguages.length === 0 ||
          wantedLanguages
            .map((l) => l.toLowerCase())
            .includes(language.toLowerCase()))
      ) {
        episodes.push({
          title,
          url,
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

export async function getLatestScans(wantedLanguages = allAvailableLanguages) {
  try {
    await init();
    const res = await axios.get(BASE_URL, { headers: getHeaders() });
    const $ = cheerio.load(res.data);

    const container = $("#containerAjoutsScans");
    const scans = [];

    container.find("a").each((_, el) => {
      const anchor = $(el);
      let url = anchor.attr("href");
      url = url.startsWith(CATALOGUE_URL)
        ? url
        : url.startsWith("/catalogue")
          ? `${BASE_URL}${url}`
          : `${CATALOGUE_URL}${url}`;
      const title = anchor.find("h2").text().trim();
      const cover = anchor.find("img").attr("src");
      const type = anchor
        .find(".badge-text")
        .first()
        .text()
        .trim()
        .toLowerCase();
      const language = url.split("/").slice(6, 7).join("");
      const chapter = anchor.find(".info-text").text().trim();
      if (
        title &&
        url &&
        cover &&
        type &&
        language &&
        chapter &&
        (wantedLanguages.length === 0 ||
          wantedLanguages
            .map((l) => l.toLowerCase())
            .includes(language.toLowerCase()))
      ) {
        scans.push({
          title,
          url,
          cover,
          type,
          language,
          chapter,
        });
      }
    });

    return scans;
  } catch (err) {
    console.error("Failed to fetch today scans:", err.message);
    return [];
  }
}

export async function getRandomAnime(
  wantedLanguages = mainAvailableLanguages,
  wantedTypes = allAvailableTypes,
  maxAttempts = 50,
  attempt = 0,
) {
  await init();
  try {
    const res = await axios.get(`${CATALOGUE_URL}/?search=&random=1`, {
      headers: getHeaders(CATALOGUE_URL),
    });

    const $ = cheerio.load(res.data);

    const anchor = $("div.catalog-card > a");
    const url = anchor.attr("href");
    const title = anchor.find("h2").first().text().trim();
    const altRaw = anchor.find("p").first().text().trim();
    const genreRaw = anchor.find("p.info-value").first().text().trim();
    const cover = anchor.find("img").first().attr("src");
    const synopsis = anchor.find("div.synopsis-content").first().text().trim();

    const altTitles = altRaw
      ? altRaw
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];
    const genres = genreRaw?.includes(",")
      ? genreRaw
          .split(",")
          .map((g) => g.trim())
          .filter(Boolean)
      : genreRaw?.includes("-")
        ? genreRaw
            .split("-")
            .map((g) => g.trim())
            .filter(Boolean)
        : [];
    const typesRaw = anchor
      .find(".info-row")
      .filter(
        (_, row) =>
          $(row).find(".info-label").text().trim().toLowerCase() === "types",
      )
      .find(".info-value")
      .text()
      .split(/[,/-]/)
      .map((t) => t.trim())
      .filter(Boolean);

    let filteredTypes =
      wantedTypes.length === 0
        ? typesRaw
        : wantedTypes.filter((type) => isWanted(type, typesRaw));
    const hasScans = filteredTypes.some((t) => t.toLowerCase() === "scans");
    const languagesRaw = anchor
      .find(".info-row")
      .filter(
        (_, row) =>
          $(row).find(".info-label").text().trim().toLowerCase() === "langues",
      )
      .find(".info-value")
      .text()
      .toLowerCase()
      .split(/[,/-]/)
      .map((t) => t.trim())
      .filter(Boolean);
    let filteredLanguages =
      wantedLanguages.length === 0
        ? languagesRaw
        : wantedLanguages.filter((lang) => isWanted(lang, languagesRaw));
    if (
      title &&
      url &&
      filteredTypes.length > 0 &&
      (filteredLanguages.length > 0 || hasScans)
    ) {
      return {
        url: url.startsWith(CATALOGUE_URL)
          ? url
          : url.startsWith("/catalogue")
            ? `${BASE_URL}${url}`
            : `${CATALOGUE_URL}${url}`,
        title,
        altTitles,
        cover,
        synopsis,
        genres,
        types: filteredTypes,
        languages: filteredLanguages,
      };
    } else {
      if (maxAttempts === null || attempt < maxAttempts) {
        return await getRandomAnime(
          wantedLanguages,
          wantedTypes,
          maxAttempts,
          attempt + 1,
        );
      } else {
        throw new Error("Max attempts reached without finding a valid anime.");
      }
    }
  } catch (err) {
    console.error("Failed to fetch random anime:", err.message);
    return [];
  }
}

export async function getChapterTitles(
  mangaUrl,
  includeNumberImg = false,
  includeEncodedTitle = false,
) {
  await init();
  const res = await axios.get(mangaUrl, { headers: getHeaders() });
  const $ = cheerio.load(res.data);

  let titles = [];
  let endBasics = [];

  const scriptTags = $("script")
    .toArray()
    .filter((script) =>
      ["newSPF", "newSP"].some((str) => $(script).html().includes(str)),
    );

  for (let script of scriptTags) {
    const html = $(script).html().split(";");
    for (const action of html) {
      titles.push(
        ...[
          ...action.matchAll(
            /(?:newSP|newSPF)\(\s*(?:"([^"]+)"|(\d+(?:\.\d+)?))\s*\)/g,
          ),
        ].map((m) => m[1] ?? `Chapitre ${m[2]}`),
      );
      
      const startBasics = [
        ...action.matchAll(/creerListe\(\s*(\d+)\s*,\s*(\d+)\s*\)/g),
      ].map((m) => ({ start: Number(m[1]), end: Number(m[2]) }));
      for (const { start, end } of startBasics) {
        for (let i = start; i <= end; i++) {
          titles.push(`Chapitre ${i}`);
        }
      }

      endBasics.push(
        ...[...action .matchAll(/finirListe\(\s*(\d+)\s*\)/g)].map((m) =>
          Number(m[1]),
        ),
      );
    }
  }

  const title = encodeURIComponent($("#titreOeuvre").text());
  const urlInfo = `${BASE_URL}/s2/scans/get_nb_chap_et_img.php?oeuvre=${title}`;
  const infoPage = await axios.get(urlInfo, { headers: getHeaders() });

  const titleChapter = infoPage.data;
  const totalChapters = Object.keys(titleChapter).length;
  let extra = endBasics.length ? Math.max(...endBasics) : 0;

  const result = [];
  let titleIndex = 0;

  for (let i = 1; i <= totalChapters; i++) {
    const number = titleChapter[String(i)];

    let chapterTitle;
    if (titles[titleIndex]) {
      chapterTitle = titles[titleIndex];
    } else if (extra > 0) {
      chapterTitle = `Chapitre ${extra}`;
      extra++;
    } else {
      chapterTitle = `Chapitre ${i}`;
    }
    if (includeNumberImg) {
      result.push({
        numberImg: number,
        title: chapterTitle,
      });
    } else {
      result.push(chapterTitle);
    }
    

    titleIndex++;
  }

  return includeEncodedTitle ? { scans: result, encodedTitle: title } : result;
}

export async function getImgScans(
  mangaUrl,
  wantedChapter,
  numberImg = null,
  encodedTitle = null,
) {
  await init();

  if (!numberImg || !encodedTitle) {
    const infoScan = await getChapterTitles(mangaUrl, true, true);
    numberImg = infoScan.scans[wantedChapter.toString()].numberImg;
    encodedTitle = infoScan.encodedTitle;
  }

  const imgUrls = [];
  for (let i = 1; i <= numberImg; i++) {
    imgUrls.push(
      `${BASE_URL}/s2/scans/${encodedTitle}/${wantedChapter + 1}/${i}.jpg`,
    );
  }

  return imgUrls;
}
