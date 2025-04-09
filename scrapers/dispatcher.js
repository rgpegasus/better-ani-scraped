import * as animesama from "./animesama.js";

export async function getSeasons(source, animeUrl, language = "vostfr") {
  if (source === "animesama") {
    return await animesama.getSeasons(animeUrl, language);
  }

  throw new Error("Unsupported source");
}

export async function searchAnime(source, query, limit = 10) {
  if (source === "animesama") {
    return await animesama.searchAnime(query, limit);
  }

  throw new Error("Unsupported source");
}

export async function getEmbed(
  source,
  animeUrl,
  hostPriority = ["sibnet", "vidmoly"]
) {
  if (source === "animesama") {
    return await animesama.getEmbed(
      animeUrl,
      (hostPriority = ["sibnet", "vidmoly"])
    );
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

export async function getAllAnime(source, output) {
  if (source === "animesama") {
    return await animesama.getAllAnime(output);
  }

  throw new Error("Unsupported source");
}
