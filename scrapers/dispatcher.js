import * as animesama from "./animesama.js";

export async function getSeasons(source, animeUrl, ...rest) {
  if (source === "animesama") {
    return await animesama.getSeasons(animeUrl, ...rest);
  }

  throw new Error("Unsupported source");
}

export async function searchAnime(source, query, ...rest) {
  if (source === "animesama") {
    return await animesama.searchAnime(query, ...rest);
  }

  throw new Error("Unsupported source");
}

export async function getEmbed(source, animeUrl, ...rest) {
  if (source === "animesama") {
    return await animesama.getEmbed(animeUrl, ...rest);
  }

  throw new Error("Unsupported source");
}

export async function getAnimeInfo(source, animeUrl) {
  if (source === "animesama") {
    return await animesama.getAnimeInfo(animeUrl);
  }

  throw new Error("Unsupported source");
}

export async function getAvailableLanguages(source, animeUrl) {
  if (source === "animesama") {
    return await animesama.getAvailableLanguages(animeUrl);
  }

  throw new Error("Unsupported source");
}

export async function getAllAnime(source, ...rest) {
  if (source === "animesama") {
    return await animesama.getAllAnime(...rest);
  }

  throw new Error("Unsupported source");
}

export async function getLatestEpisodes(source, ...rest) {
  if (source === "animesama") {
    return await animesama.getLatestEpisodes(...rest);
  }

  throw new Error("Unsupported source");
}
