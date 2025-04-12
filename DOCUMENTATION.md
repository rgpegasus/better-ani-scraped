# Ani-Scraped Documentation

A set of utility functions for scraping anime data from multiple sources (only [anime-sama](https://anime-sama.fr) and [animepahe](https://animepahe.ru) available at the moment). This tool allows you to search for anime, retrieve information, get episodes, and more.

---

## Summary
- [Main class](#main-class)
- [`AnimeScrapper("animesama")` methods](#animescrapperanimesama-methods)
- [`AnimeScrapper("animepahe")` methods](#animescrapperanimepahe-methods)
- [Functions](#functions)

---

## Main class

### `AnimeScraper(source)`
Creates a scrapper for the given source (only "animesama" and "animepahe" available at the moment).

---

## `AnimeScrapper("animesama")` methods

- [searchAnime](#searchanimequery-limit--10)
- [getSeasons](#getseasonsanimeurl-language--vostfr)
- [getEmbed](#getembedanimeurl-hostpriority--sibnet-vidmoly)
- [getAnimeInfo](#getanimeinfoanimeurl)
- [getAvailableLanguages](#getavailablelanguagesanimeurl-wantedlanguages)
- [getAllAnime](#getallanimeoutput--anime_listjson-get_seasons--false)
- [getLatestEpisodes](#getlatestepisodeslanguagefilter--null)
- [getRandomAnime](#getrandomanime)

### `searchAnime(query, limit = 10)`
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

### `getSeasons(animeUrl, language = "vostfr")`
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

### `getEmbed(animeUrl, hostPriority = ["sibnet", "vidmoly"])`
Retrieves embed URLs for episodes, prioritizing by host.

- **Parameters:**
  - `animeUrl` *(string)*: URL of the anime’s season/episode page.
  - `hostPriority` *(string[])*: Array of preferred hostnames.
- **Returns:**  
  An array of embed video URLs.

---

### `getAnimeInfo(animeUrl)`
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

### `getAvailableLanguages(animeUrl, wantedLanguages)`
Checks which languages are available for a given anime.

- **Parameters:**
  - `animeUrl` *(string)*: The base anime URL.
  - `wantedLanguages` *(string[])*: Language codes to check (e.g., ["vf", "va"]).
- **Returns:**  
  Array of available language codes in uppercase.

---

### `getAllAnime(output = "anime_list.json", get_seasons = false)`
Fetches the full anime catalog, optionally including season information.

- **Parameters:**
  - `output` *(string)*: File name to save the result as JSON.
  - `get_seasons` *(boolean)*: If `true`, also fetches seasons for each anime (very slow, ETA is still unknown).
- **Returns:**  
  `true` if successful, `false` otherwise.

---

### `getLatestEpisodes(languageFilter = null)`
Scrapes the latest released episodes, optionally filtered by language.

- **Parameters:**
  - `languageFilter` *(string|null)*: If set, filters episodes by language.
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

### `getRandomAnime()`
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

## `AnimeScrapper("animepahe")` methods

- [searchAnime](#searchanimequery)


### `searchAnime(query)`
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