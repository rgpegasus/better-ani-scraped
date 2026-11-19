import axios from "axios";
import * as cheerio from "cheerio";

const LIST_URL = "https://anime-sama.pw";


export async function getWorkingUrl(listUrl = LIST_URL) {
  try {
    const res = await axios.get(listUrl);
    const $ = cheerio.load(res.data);

    const btn = $(".btn-primary").attr("href");

    if (!btn) {
      throw new Error("Lien du site introuvable");
    }
    const initialUrl = new URL(btn, listUrl).href;

    const response = await fetch(initialUrl, {
      method: "GET",
      headers: {"Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8"},
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    let finalUrl = response.url || initialUrl;
    finalUrl = finalUrl.replace(/\/+$/, "");
    return finalUrl;

  } catch (err) {
    console.error("[URL] Erreur :", err);
    throw err;
  }
}

let BASE_URL;
let CATALOGUE_URL;

axios.defaults.timeout = 15000;

const INIT_TTL_MS = 30 * 60 * 1000;
let initAt = 0;
let initPromise = null;

async function init(force = false) {
  if (!force && BASE_URL && Date.now() - initAt < INIT_TTL_MS) return;
  if (!initPromise) {
    initPromise = getWorkingUrl()
      .then((url) => {
        BASE_URL = url;
        CATALOGUE_URL = `${url}/catalogue`;
        initAt = Date.now();
      })
      .finally(() => { initPromise = null; });
  }
  return initPromise;
}

const MOBILE_USER_AGENT = 
  "Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0  Mobile Safari/537.36";

function getHeaders(referer = BASE_URL) {
  return {
    "User-Agent": MOBILE_USER_AGENT,
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
    "Referer": referer,
  }
}

function isWanted(text, list) {
  return (
    list.length === 0 ||
    list.some((item) => text.toLowerCase().includes(item.toLowerCase()))
  );
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
const languageMap = {
  jp: "vostfr",
  fr: "vf",
  en: "va",
  kr: "vkr",
  cn: "vcn",
  qc: "vqc",
};
let mainAvailableLanguages = ["vostfr", "vf", "vastfr"];  
let allAvailableTypes = ["Anime", "Film", "Scans", "Webtoon", "Autres"];

function parseCatalog($, html, wantedLanguages, wantedTypes) {
  const url = html.attr("href");
  const title = html.find(".as-carte-titre").text().trim();
  const cover = html.find("img").first().attr("src");

  const typesRaw = html
    .find(".as-carte-badges .as-badge")
    .map((_, el) => $(el).text().trim())
    .get()
    .filter(Boolean);

  let filteredTypes =
    wantedTypes.length === 0
      ? typesRaw
      : wantedTypes.filter((type) => isWanted(type, typesRaw));
  const hasScans = filteredTypes.some((t) => t.toLowerCase() === "scans");
  const languagesRaw = html
    .find(".as-carte-badges .as-drapeau img")
    .map((_, el) => {
      const lang = $(el).attr("title")?.trim();
      return lang ? languageMap[lang.toLowerCase()] ?? lang : null;
    })
    .get()
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
      cover,
      types: filteredTypes,
      languages: filteredLanguages,
    };
  }
}

function parseCarousel($, html, wantedLanguages, type = "") {
  const url = html.find("a.as-carte-lien").attr("href");
  const title = html.find(".as-carte-titre").text().trim()
  const cover = html.attr("data-img") ?? null
  const types = html
    .find(".as-carte-badges .as-badge")
    .map((_, badge) => $(badge).text().trim())
    .get()
    .filter(Boolean)
  
  const languagesRaw = html
    .find(".as-carte-badges .as-drapeau img")
    .map((_, img) => $(img).attr("title")?.trim()) 
    .get()
    .filter(Boolean)
  let filteredLanguages =
    wantedLanguages.length === 0
      ? languagesRaw
      : wantedLanguages.filter((lang) => isWanted(lang, languagesRaw));
  
  if (
    title &&
    url &&
    filteredLanguages.length > 0
  ) {
    if(type === "") {
      return {
        url: url.startsWith(CATALOGUE_URL)
          ? url
          : url.startsWith("/catalogue")
            ? `${BASE_URL}${url}`
            : `${CATALOGUE_URL}${url}`,
        title,
        cover,
        types,
        languages: filteredLanguages,
      };
    } else {
      const subTitle = html
        .find(".as-carte-info span")
        .first()
        .text()
        .trim()
        .replace(/[A-ZÀ-ÖØ-Þ]/g, (char) =>
          char.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        );
      return {
        url: url.startsWith(CATALOGUE_URL)
          ? url
          : url.startsWith("/catalogue")
            ? `${BASE_URL}${url}`
            : `${CATALOGUE_URL}${url}`,
        title,
        cover,
        types,
        language:filteredLanguages[0],
        [type]: subTitle,
      };
    }
  }
}

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
    const containers = $("#list_catalog > .as-carte > a.as-carte-lien");

    containers.each((_, el) => {
      if (results.length >= limit) return false;

      const anchor = $(el);
      const data = parseCatalog($, anchor, wantedLanguages, wantedTypes);
      if(data) {
        results.push(data);
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
  const res = await axios.get(animeUrl, { headers: getHeaders(animeUrl) });
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
            /(panneauAnime|panneauScan)\("([^"]+)", "([^"]+)"\)/g,
          ),
        ];

        const langs = wantedLanguages.length ? wantedLanguages : allAvailableLanguages;

        const found = await Promise.all(
          matches.map(async (match) => {
            const title = match[2];
            if (!title) return null;
            const seasonId = match[3].split("/")[0];
            for (const lang of langs) {
              const fullUrl = `${animeUrl.split("/").slice(0,5).join("/")}/${seasonId}/${lang}`;
              try {
                const res = await axios.head(fullUrl, { headers: getHeaders(animeUrl) });
                if (res.status === 200) {
                  return {
                    title,
                    url: fullUrl,
                    language: lang,
                    type: typeKey ? typeKey[0].toUpperCase() + typeKey.slice(1) : "",
                  };
                }
              } catch {}
            }
            return null;
          })
        );

        seasons.push(...found.filter(Boolean));
      }
    }
  }
  return seasons;
}

export async function getEpisodeTitles(seasonUrl, numberEpisode, html = null) {
  const page = html ?? (
    await axios.get(seasonUrl, {
      headers: getHeaders(seasonUrl),
    })
  ).data;

  const $ = cheerio.load(page);
  const scriptTags = $("script")
    .toArray()
    .filter((script) =>
      ["newSPF", "newSP"].some((str) => $(script).html().includes(str)),
    );

  let epRetards = 0;
  let listEpisodes = [];
  let first = null;
  for (const script of scriptTags) {
    const html = $(script)
    .html()
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "").split(";");
    for (const action of html) {
      const newSPF = [
        ...action.matchAll(/newSPF\(\s*(?:"([^"]+)"|(\d+(?:\.\d+)?))\s*\)/g),
      ];
      if (newSPF.length > 0) {
        for (const match of newSPF) {
          listEpisodes.push(match[1] || match[2]);
          epRetards++;
        }
        continue;
      }
      const newSP = [
        ...action.matchAll(/newSP\(\s*(?:"([^"]+)"|(\d+(?:\.\d+)?))\s*\)/g),
      ];
      if (newSP.length > 0) {
        for (const match of newSP) {
          listEpisodes.push("Episode " + (match[1] || match[2]));
          epRetards++;
        }
        continue;
      }
      const creerListe = action.match(/creerListe\(\s*(\d+)\s*,\s*(\d+)\s*\)/);
      if (creerListe) {
        const debut = parseInt(creerListe[1]);
        const fin = parseInt(creerListe[2]);
        if (!first) {
          first = debut;
        }
        for (let i = debut; i <= fin; i++) {
          listEpisodes.push("Episode " + i);
        }
        continue;
      }
      const finirListe = action.match(/finirListe\w*\(\s*(\d+)\s*\)/);
      if (finirListe) {
        const debut = parseInt(finirListe[1]);
        const fin = debut + numberEpisode - listEpisodes.length - 1;
        for (let i = debut; i <= fin; i++) {
          listEpisodes.push("Episode " + i);
        }
        continue;
      }
    }
    const size = listEpisodes.length;
    if (size < numberEpisode) {
      const debut = size == 0 ? 1 : first + size - epRetards;
      const fin = size == 0 ? numberEpisode : first + numberEpisode - epRetards - 1;
      for (let i = debut; i <= fin; i++) {
        listEpisodes.push("Episode " + i);
      }
    }
  }

  return listEpisodes;
}

const LIEN_CONCURRENCY = 3;   
let lienActive = 0;
const lienQueue = [];
function limitLien(task) {
  return new Promise((resolve, reject) => {
    const run = async () => {
      lienActive++;
      try { 
        resolve(await task()); 
      } catch (e) { 
        reject(e); 
      }
      finally { 
        lienActive--; 
        lienQueue.shift()?.(); 
      }
    };
    lienActive < LIEN_CONCURRENCY ? run() : lienQueue.push(run);
  });
}

const lienCache = new Map();    
const lienInflight = new Map();

export function resolveLienUrl(url, referer = url) {
  const hit = lienCache.get(url);
  if (hit && hit.expires > Date.now()) return Promise.resolve(hit.value);
  if (lienInflight.has(url)) return lienInflight.get(url);

  const p = limitLien(async () => {
    try {
      const { data } = await axios.get(url, { headers: getHeaders(referer) });
      const value = data?.u || null;
      if (value) lienCache.set(url, { value, expires: Date.now() + 30 * 60 * 1000 });
      return value;
    } catch (err) {
      console.warn("[lien.php]", err.response?.status ?? err.message);
      return null; 
    }
  }).finally(() => lienInflight.delete(url));

  lienInflight.set(url, p);
  return p;
}

export async function getEmbed(
  seasonUrl,
  hostPriority = ["ansembed", "sendvid", "smoothpre", "uqload", "susanexpectcare"],
  allHost = false,
  includeInfo = false,
  lazy = false,
) {
  const res = await axios.get(seasonUrl, {
    headers: getHeaders(seasonUrl.split("/").slice(0, 5).join("/")),
  });

  const $ = cheerio.load(res.data);

  const scripts = $("script").toArray().map((s) => $(s).html() || "");
  const pageScripts = scripts.join("\n");

  const seasonTitle =
    pageScripts.match(/#avOeuvre"\)\.html\("([^"]+)"/)?.[1] ||
    "Saison inconnue";

  const epsJeton = pageScripts.match(/epsJeton\s*=\s*["']([^"']+)["']/)?.[1];
  if (!epsJeton) throw new Error("Episode token not found");

  const matches = [
    ...pageScripts.matchAll(/var\s+(eps\d+)\s*=\s*(\[[\s\S]*?\])/g),
  ];

  if (!matches.length) throw new Error("No episode arrays found");

  const episodeMatrix = matches.map(([, , arr]) => JSON.parse(arr));

  const titles = await getEpisodeTitles(seasonUrl, episodeMatrix[0].length, res.data);
  const maxEpisodes = titles.length || Math.max(...episodeMatrix.map((arr) => arr.length));

  const resolveLink = (link) =>
    link?.startsWith("lien:")
      ? resolveLienUrl(new URL(`/api/lien.php?j=${epsJeton}&l=${link.slice(5)}`, seasonUrl).href, seasonUrl)
      : link;

  const finalEmbeds = []; 

  if (lazy) {
    const toUrl = (link) =>
      link?.startsWith("lien:")
        ? new URL(`/api/lien.php?j=${epsJeton}&l=${link.slice(5)}`, seasonUrl).href
        : link;
    const lazyEmbeds = [];
    for (let i = 0; i < maxEpisodes; i++) {
      const urls = episodeMatrix.map((arr) => (i < arr.length ? toUrl(arr[i]) : null)).filter(Boolean);
      if (urls.length) lazyEmbeds.push({ title: titles[i] || `Episode ${i + 1}`, url: urls, host: [], lazy: true });
    }
    return includeInfo
      ? { episodes: lazyEmbeds, animeInfo: { seasonTitle, episodeCount: maxEpisodes } }
      : lazyEmbeds;
  }
  const hasPriority = Array.isArray(hostPriority) && hostPriority.length > 0;

  for (let i = 0; i < maxEpisodes; i++) {
    const links = await Promise.all(
      episodeMatrix.map((arr) => (i < arr.length ? resolveLink(arr[i]) : null)),
    );

    const validUrls = links
      .filter(Boolean)
      .map((url) => url.replace("vidmoly.to/", "vidmoly.biz/"));

    let unique = [];

    if (!hasPriority) {
      unique = validUrls.map((url) => {
        let host = "unknown";
        try {
          const parts = new URL(url).hostname.replace(/^www\./, "").split(".");
          host = parts.length >= 2 ? parts[parts.length - 2] : parts[0];
        } catch {}
        return { url, host };
      });
    } else {
      const candidates = validUrls
        .map((url) => ({
          url,
          host: hostPriority.find((host) =>
            url.toLowerCase().includes(host.toLowerCase()),
          ),
        }))
        .filter((item) => item.host);

      const selected = hostPriority
        .map((host) =>
          candidates.find(
            (item) => item.host.toLowerCase() === host.toLowerCase(),
          ),
        )
        .filter(Boolean);

      unique = selected.filter(
        (item, index, arr) =>
          arr.findIndex((other) => other.host === item.host) === index,
      );
    }

    if (unique.length) {
      if (allHost || !hasPriority) {
        finalEmbeds.push({
          title: titles[i] || `Episode ${i + 1}`,
          url: unique.map((item) => item.url),
          host: unique.map((item) => item.host.toLowerCase()),
        });
      } else {
        finalEmbeds.push({
          title: titles[i] || `Episode ${i + 1}`,
          url: unique[0].url,
          host: unique[0].host.toLowerCase(),
        });
      }
    }
  }

  if (includeInfo) {
    return {
      episodes: finalEmbeds,
      animeInfo: {
        seasonTitle,
        episodeCount: maxEpisodes,
      },
    };
  }

  return finalEmbeds;
}

export async function getAnimeInfo(animeUrl) {
  await init();
  const res = await axios.get(animeUrl, { headers: getHeaders(animeUrl) });
  const $ = cheerio.load(res.data);

  const cover = $(".oe-affiche img").attr("src") ?? null;
  const title = $("#titreOeuvre").text().trim();
  const bannerSrc = $("div.oe-fond > img").attr("src");
  const banner = bannerSrc?.startsWith("/img") ? `${BASE_URL}${bannerSrc}` : bannerSrc ?? null;
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
      : altRaw
        ? altRaw
            .split("-")
            .map((t) => t.trim())
            .filter(Boolean)
        : [];

  const genres = $(".oe-genres .genre-pill").map((i, el) => $(el).text().trim()).get();
  const synopsis = $("#synopsisText").text().trim();
  const similaires = $("#containerSimilaires .as-carte-oeuvre")
  .map((_, el) => {
    const anchor = $(el);
    const data = parseCarousel($, anchor, []);
    if(data) {
      return data;
    }
  })
  .get()
  .filter((anime) => anime.url && anime.title);
  return {
    title,
    altTitles,
    cover,
    banner,
    genres,
    synopsis,
    similaires,
  };
}

export async function getAvailableLanguages(
  seasonUrl,
  wantedLanguages = allAvailableLanguages,
  includeNumberEpisodes = false,
) {
  const link = seasonUrl.split("/").slice(0,6).join("/") + "/";
  const langs = wantedLanguages.length ? wantedLanguages : allAvailableLanguages;

  const results = await Promise.all(
    langs.map(async (language) => {
      const languageUrl = link + language;
      try {
        const res = includeNumberEpisodes
          ? await axios.get(languageUrl, { headers: getHeaders(seasonUrl) })
          : await axios.head(languageUrl, { headers: getHeaders(seasonUrl) });

        if (res.status !== 200) return null;

        if (!includeNumberEpisodes) {
          return language.toLowerCase();
        }

        const $ = cheerio.load(res.data);
        const scripts = $("script")
          .toArray()
          .map((el) => $(el).html() || "")
          .join("\n");
        const lengths = [...scripts.matchAll(/var\s+eps\d+\s*=\s*(\[[\s\S]*?\])/g)].map((m) => {
          try {
            return JSON.parse(m[1]).length;
          } catch {
            return 0;
          }
        });

        return {
          language: language.toLowerCase(),
          episodeCount: lengths.length ? Math.max(...lengths) : 0,
        };
      } catch {
        return null;
      }
    }),
  );

  return results.filter(Boolean);
}

export async function getAllAnime(
  wantedLanguages = mainAvailableLanguages,
  wantedTypes = allAvailableTypes,
  wantedPage = null,
  includeSeasons = false,
) {
  await init();
  let animeLinks = [];

  const fetchPage = async (pageNum) => {
    const url = pageNum === 1 ? CATALOGUE_URL : `${CATALOGUE_URL}?page=${pageNum}`;
    const res = await axios.get(url, { headers: getHeaders(CATALOGUE_URL) });
    const $ = cheerio.load(res.data);

    const containers = $("#list_catalog > .as-carte > a.as-carte-lien");

    containers.each((_, el) => {
      const anchor = $(el);
      const data = parseCatalog($, anchor, wantedLanguages, wantedTypes);
      if(data) {
        animeLinks.push(data);
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
          `Failed to fetch seasons for ${anime.title}: ${err.message}`,
        );
        anime.seasons = [];
      }
      await new Promise((r) => setTimeout(r, 300));
    }
  };

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
    return uniqueLinks;
  }
}

export async function getLatestEpisodes(
  wantedLanguages = allAvailableLanguages,
) {
  await init();
  const res = await axios.get(BASE_URL, { headers: getHeaders() });
  const $ = cheerio.load(res.data);

  const container = $("#containerAjoutsAnimes");
  const episodes = [];

  container.find(".as-carte-anime").each((_, el) => {
    const anchor = $(el);
    const data = parseCarousel($, anchor, wantedLanguages, "episode");
    if(data) {
      episodes.push(data);
    }
  });

  return episodes;
}

export async function getLatestScans(wantedLanguages = allAvailableLanguages) {
  await init();
  const res = await axios.get(BASE_URL, { headers: getHeaders() });
  const $ = cheerio.load(res.data);
  const container = $("#containerAjoutsScans");
  const scans = [];
  container.find(".as-carte-scan").each((_, el) => {
    const anchor = $(el);
    const data = parseCarousel($, anchor, wantedLanguages, "chapter");
    if(data) {
      scans.push(data);
    }
  });

  return scans;
}

export async function getRandomAnime(
  wantedLanguages = mainAvailableLanguages,
  wantedTypes = allAvailableTypes,
  maxAttempts = 50,
) {
  await init();
  for (let attempt = 0; attempt <= (maxAttempts ?? 50); attempt++) {
    const res = await axios.get(`${CATALOGUE_URL}/?search=&random=1`, {
      headers: getHeaders(CATALOGUE_URL),
    });
    const $ = cheerio.load(res.data);
    const anchor = $("#list_catalog > .as-carte > a.as-carte-lien");
    const data = parseCatalog($, anchor, wantedLanguages, wantedTypes);
    if (data) return data;
  }
  throw new Error("Aucun anime valide trouvé");
}

export async function getChapterTitles(
  mangaUrl,
  includeNumberImg = false,
  includeEncodedTitle = false,
) {
  const res = await axios.get(mangaUrl, { headers: getHeaders(mangaUrl) });

  const $ = cheerio.load(res.data);
  const scriptTags = $("script")
    .toArray()
    .filter((script) =>
      ["newSPF", "newSP"].some((str) => $(script).html().includes(str)),
    );
  const title = encodeURIComponent($("#titreOeuvre").text());
  const urlInfo = `${mangaUrl.split("/").slice(0, 3).join("/")}/s2/scans/get_nb_chap_et_img.php?oeuvre=${title}`;
  const infoPage = await axios.get(urlInfo, { headers: getHeaders(mangaUrl) });
  const titleChapter = infoPage.data;
  if (!titleChapter || typeof titleChapter !== "object")
    throw new Error("Réponse invalide de get_nb_chap_et_img.php");

  const totalChapters = Object.keys(titleChapter).length;
  let epRetards = 0;
  let listChapters = [];
  let first = null;
  for (const script of scriptTags) {
    const html = $(script)
      .html()
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\/\/.*$/gm, "")
      .split(";");
    for (const action of html) {
      const newSPF = [
        ...action.matchAll(/newSPF\(\s*(?:"([^"]+)"|(\d+(?:\.\d+)?))\s*\)/g),
      ];
      if (newSPF.length > 0) {
        for (const match of newSPF) {
          listChapters.push(match[1] || match[2]);
          epRetards++;
        }
        continue;
      }
      const newSP = [
        ...action.matchAll(/newSP\(\s*(?:"([^"]+)"|(\d+(?:\.\d+)?))\s*\)/g),
      ];
      if (newSP.length > 0) {
        for (const match of newSP) {
          listChapters.push("Chapitre " + (match[1] || match[2]));
          epRetards++;
        }
        continue;
      }
      const creerListe = action.match(/creerListe\(\s*(\d+)\s*,\s*(\d+)\s*\)/);
      if (creerListe) {
        const debut = parseInt(creerListe[1]);
        const fin = parseInt(creerListe[2]);
        if (!first) {
          first = debut;
        }
        for (let i = debut; i <= fin; i++) {
          listChapters.push("Chapitre " + i);
        }
        continue;
      }
      const finirListe = action.match(/finirListe\w*\(\s*(\d+)\s*\)/);
      if (finirListe) {
        const debut = parseInt(finirListe[1]);
        const fin = debut + totalChapters - listChapters.length - 1;
        for (let i = debut; i <= fin; i++) {
          listChapters.push("Chapitre " + i);
        }
        continue;
      }
    }
    const size = listChapters.length;
    if (size < totalChapters) {
      const debut = size == 0 ? 1 : first + size - epRetards;
      const fin =
        size == 0 ? totalChapters : first + totalChapters - epRetards - 1;
      for (let i = debut; i <= fin; i++) {
        listChapters.push("Chapitre " + i);
      }
    }
  }
  const result = [];
  let titleIndex = 0;

  for (let i = 1; i <= totalChapters; i++) {
    const number = titleChapter[String(i)];

    const chapterTitle = listChapters[titleIndex];
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
    const chapter = infoScan.scans[wantedChapter];
    if (!chapter) throw new Error("Chapitre introuvable");
    numberImg = chapter.numberImg;
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
