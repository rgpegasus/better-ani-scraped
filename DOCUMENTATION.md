# Ani-Scraped Documentation

A set of utility functions for scraping anime data from multiple sources (only [anime-sama](https://anime-sama.fr) and [animepahe](https://animepahe.ru) available at the moment). This tool allows you to search for anime, retrieve information, get episodes, and more.

---

## Summary
- [Main class](#main-class)
- [`AnimeScrapper("animesama")` methods](#animescrapperanimesama-methods)
- [`AnimeScrapper("animepahe")` methods](#animescrapperanimepahe-methods)
- [`AnimeScrapper("crunchyroll")` methods](#animescrappercrunchyroll-methods)
- [Functions](#functions)

---

## Main class

### `AnimeScraper(source)`
Creates a scrapper for the given source (only "animesama", "animepahe" and "crunchyroll" available at the moment).

---

## `AnimeScrapper("animesama")` methods

- [searchAnime](#animesamasearchanimequery-limit--10)
- [getSeasons](#animesamagetseasonsanimeurl-language--vostfr)
- [getEmbed](#animesamagetembedanimeurl-hostpriority--sibnet-vidmoly)
- [getAnimeInfo](#animesamagetanimeinfoanimeurl)
- [getAvailableLanguages](#animesamagetavailablelanguagesseasonurl-wantedlanguages--vostfr-vf-va-vkr-vcn-vqc)
- [getAllAnime](#animesamagetallanimeoutput--anime_listjson-get_seasons--false)
- [getLatestEpisodes](#animesamagetlatestepisodeslanguagefilter--null)
- [getRandomAnime](#animesamagetrandomanime)
- [getEpisodeTitles](#animesamagetepisodetitlesanimeurl-customChromiumPath)

### `animesama.searchAnime(query, limit = 10)`
Searches for anime titles that match the given query.

- **Parameters:**
  - `query` *(string)*: The search keyword.
  - `limit` *(number)*: Maximum number of results to return (default: 10).
- **Returns:**  
  An array of anime objects:
  ```js
  [
    {
      title: string,
      altTitles: string[],
      genres: string[],
      url: string,
      cover: string
    },
    ...
  ]
  ```

---

### `animesama.getSeasons(animeUrl, language = "vostfr")`
Fetches all available seasons of an anime in the specified language.

- **Parameters:**
  - `animeUrl` *(string)*: The full URL of the anime.
  - `language` *(string)*: Language to filter by (default: "vostfr").
- **Returns:**  
  Either an array of season objects:
  ```js
  [
    { 
      title: string, 
      url: string 
    },
    ...
  ]
  ```
  Or an error object if the language is not available.

---

### `animesama.getEmbed(animeUrl, hostPriority = ["sibnet", "vidmoly"])`
Retrieves embed URLs for episodes, prioritizing by host.

- **Parameters:**
  - `animeUrl` *(string)*: URL of the anime’s season/episode page.
  - `hostPriority` *(string[])*: Array of preferred hostnames.
- **Returns:**  
  An array of embed video:
  ```js
  {
    title: string,
    url: string,
  }
  ```
---

### `animesama.getAnimeInfo(animeUrl)`
Extracts basic information from an anime page.

- **Parameters:**
  - `animeUrl` *(string)*: The URL of the anime.
- **Returns:**  
  An object containing:
  ```js
  {
    title: string,
    altTitles: string[],
    cover: string,
    genres: string[],
    synopsis: string
  }
  ```

---

### `animesama.getAvailableLanguages(seasonUrl, wantedLanguages = ["vostfr", "vf", "va", "vkr", "vcn", "vqc"])`
Checks which languages are available for a given anime season (not recommended to use the default value of wantedLanguages, the more languages there is the more the function is long to run, only checks for languages you want).

- **Parameters:**
  - `seasonUrl` *(string)*: The season anime URL.
  - `wantedLanguages` *(string[])*: Language codes to check (e.g., ["vostfr", "vf", "va", ...]).
- **Returns:**  
  Array of objects containing available languages and their episode count:
  ```js
  [
    {
      language: string,
      episodeCount: int
    }
    ...
  ]
  ```

---

### `animesama.getAllAnime(output = "anime_list.json", get_seasons = false)`
Fetches the full anime catalog, optionally including season information.

- **Parameters:**
  - `output` *(string)*: File name to save the result as JSON.
  - `get_seasons` *(boolean)*: If `true`, also fetches seasons for each anime (very slow, ETA is still unknown).
- **Returns:**  
  `true` if successful, `false` otherwise.

---

### `animesama.getLatestEpisodes(languageFilter = null)`
Scrapes the latest released episodes, optionally filtered by language.

- **Parameters:**
  - `languageFilter` *(string[]|null)*: If set, filters episodes by language in the array. If null, returns all episodes. 
- **Returns:**  
  Array of episode objects:
  ```js
  {
    title: string,
    url: string,
    cover: string,
    language: string,
    episode: string
  }
  ```

---

### `animesama.getRandomAnime()`
Fetches a random anime from the catalogue.

- **Returns:**  
  An anime object:
  ```js
  {
    title: string,
    altTitles: string[],
    genres: string[],
    url: string,
    cover: string
  }
  ```

---

### `animesama.getEpisodeTitles(AnimeUrl, customChromiumPath)`
Fetches the names of all episodes in a season

- **Parameters:**
  - `animeUrl` *(string)*: URL of the anime’s season/episode page.
  - `customChromiumPath` *(string)*: Path of the Chromium folder
- **Returns:**  
  An array of episode titles.

---

## `AnimeScrapper("animepahe")` methods

- [searchAnime](#animepahesearchanimequery)


### `animepahe.searchAnime(query)`
Searches for anime titles that match the given query.

- **Parameters:**
  - `query` *(string)*: The search keyword.
- **Returns:**  
  An array of anime objects:
  ```js
  [
    {
      id: int,
      title: string,
      type: string,
      episodes: int,
      status: string,
      season: string,
      year: int,
      score: float,
      session: string,
      cover: string,
      url: string
    },
    ...
  ]
  ```

---

## `AnimeScrapper("crunchyroll")` methods

- [searchAnime](#crunchyrollsearchanimequery-limit--10)
- [getEpisodeInfo](#crunchyrollgetepisodeinfoanimeurl-seasontitle)


### `crunchyroll.searchAnime(query, limit = 10)`
Searches for anime titles that match the given query.

- **Parameters:**
  - `query` *(string)*: The search keyword.
  - `limit` *(number)*: Maximum number of results to return (default: 10).
- **Returns:**  
  An array of anime objects:
  ```js
  [
    {
      title: string,
      url: string,
      cover: string
    },
    ...
  ]
  ```

### `crunchyroll.getEpisodeInfo(animeUrl, seasonTitle)`
Extracts information from all episodes of a season of an anime.

- **Parameters:**
  - `animeUrl` *(string)*: Anime page URL.
  - `seasonTitle` *(string)*: Name of the season for which you want episode information. If null, returns episodes from season 1.
- **Returns:**  
  An array of episode objects:
  ```js
  [
    {
      title: string,
      synopsis: string,
      releaseDate: string,
      cover: string
    },
    ...
  ]
  ```
---

## Functions

- [getVideoUrlFromEmbed](#getvideourlfromembedsource-embedurl)

### `getVideoUrlFromEmbed(source, embedUrl)`
Retrieves the video URL of the source's embed.

- **Parameters:**
  - `source` *(string)*: The embed source (only "sibnet" available at the moment)
  - `embedUrl` *(string)*: The embed url of the given source.
- **Returns:**  
  A video URL as a string.

---
---
---
---

> ⚠️ This project scrapes data from online sources. Use at your own risk.
