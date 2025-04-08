import axios from "axios";
import * as cheerio from 'cheerio';

// Base domain
const BASE_URL = "https://anime-sama.fr";

export async function searchAnime(query, limit = 10) { // Maximum limit is 48
  const url = `${BASE_URL}/catalogue/?type%5B%5D=Anime&search=${encodeURIComponent(query)}`;
  const res = await axios.get(url);
  const $ = cheerio.load(res.data);
  const results = {};

  $('a.flex.divide-x').each((i, el) => {
    if (i >= limit) return false;

    const link = $(el).attr('href');
    const title = $(el).find('h1').first().text().trim();

    if (title && link) {
      results[title] = link.startsWith('http') ? link : `${BASE_URL}${link}`;
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
    const matches = [
      ...content.matchAll(/panneauAnime\("([^"]+)", "([^"]+)"\);/g),
    ];

    for (let match of matches) {
      const name = match[1];
      const href = match[2].split("/")[0];
      const fullUrl = `${BASE_URL}/catalogue/${animeName}/${href}/${language}`;

      if (name !== "nom" && href !== "url") {
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
  }

  if (!languageAvailable) {
    return { error: `Language "${language}" is not available for this anime.` };
  }

  return seasons;
}

export async function getEmbed(animeUrl, hostPriority=['sibnet', 'vidmoly']) {
  const res = await axios.get(animeUrl);
  const $ = cheerio.load(res.data);

  // Find the script that contains episode URLs
  const scriptTag = $('script[src*="episodes.js"]').attr('src');
  if (!scriptTag) throw new Error('No episodes script found');

  const scriptUrl = animeUrl.endsWith('/')
    ? animeUrl + scriptTag
    : animeUrl + '/' + scriptTag;

  const episodesJs = await axios.get(scriptUrl).then(r => r.data);

  // Match all "var epsX = [ ... ]" arrays
  const matches = [...episodesJs.matchAll(/var\s+(eps\d+)\s*=\s*(\[[^\]]+\])/g)];
  if (!matches.length) throw new Error('No episode arrays found');

  let allEmbeds = [];

  for (const [, , arrayString] of matches) {
    try {
      const links = eval(arrayString); // we assume trusted source
      allEmbeds.push(...links);
    } catch (e) {
      console.warn('Could not parse embed array:', e);
    }
  }

  // Sort embeds by host
  for (const host of hostPriority) {
    const filtered = allEmbeds.filter(url => url.includes(host));
    if (filtered.length) {
      return filtered;
    }
  }

  // If no preferred host is found, return whatever's left
  return allEmbeds;
}