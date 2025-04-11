# Ani-Scraped Documentation

A set of utility functions for scraping anime data from multiple sources (only [anime-sama.fr](https://anime-sama.fr) available at the moment). This tool allows you to search for anime, retrieve information, get episodes, and more.

---

## Functions

### `searchAnime(source, query, limit = 10)`
Searches for anime titles that match the given query.

- **Parameters:**
  - `source` *(string)*: The scraping source (only "animesama" available at the moment)
  - `query` *(string)*: The search keyword.
  - `limit` *(number)*: Maximum number of results to return (default: 10).
- **Returns:**  
  An array of anime objects:
  ```js
  {
    name: string,
    altTitles: string[],
    genres: string[],
    url: string,
    cover: string
  }
  ```

---

### `getSeasons(source, animeUrl, language = "vostfr")`
Fetches all available seasons of an anime in the specified language.

- **Parameters:**
  - `source` *(string)*: The scraping source (only "animesama" available at the moment)
  - `animeUrl` *(string)*: The full URL of the anime.
  - `language` *(string)*: Language to filter by (default: "vostfr").
- **Returns:**  
  Either an array of season objects:
  ```js
  { name: string, url: string }
  ```
  Or an error object if the language is not available.

---

### `getEmbed(source, animeUrl, hostPriority = ["sibnet", "vidmoly"])`
Retrieves embed URLs for episodes, prioritizing by host.

- **Parameters:**
  - `source` *(string)*: The scraping source (only "animesama" available at the moment)
  - `animeUrl` *(string)*: URL of the anime’s season/episode page.
  - `hostPriority` *(string[])*: Array of preferred hostnames.
- **Returns:**  
  An array of embed video URLs.

---

### `getAnimeInfo(source, animeUrl)`
Extracts basic information from an anime page.

- **Parameters:**
  - `source` *(string)*: The scraping source (only "animesama" available at the moment)
  - `animeUrl` *(string)*: The URL of the anime.
- **Returns:**  
  An object containing:
  ```js
  {
    cover: string,
    genres: string[],
    synopsis: string
  }
  ```

---

### `getAvailableLanguages(source, animeUrl, wantedLanguages)`
Checks which languages are available for a given anime.

- **Parameters:**
  - `source` *(string)*: The scraping source (only "animesama" available at the moment)
  - `animeUrl` *(string)*: The base anime URL.
  - `wantedLanguages` *(string[])*: Language codes to check (e.g., ["vf", "va"]).
- **Returns:**  
  Array of available language codes in uppercase.

---

### `getAllAnime(source, output = "anime_list.json", get_seasons = false)`
Fetches the full anime catalog, optionally including season information.

- **Parameters:**
  - `source` *(string)*: The scraping source (only "animesama" available at the moment)
  - `output` *(string)*: File name to save the result as JSON.
  - `get_seasons` *(boolean)*: If `true`, also fetches seasons for each anime (⚠️ slow).
- **Returns:**  
  `true` if successful, `false` otherwise.

---

### `getLatestEpisodes(source, languageFilter = null)`
Scrapes the latest released episodes, optionally filtered by language.

- **Parameters:**
  - `source` *(string)*: The scraping source (only "animesama" available at the moment)
  - `languageFilter` *(string|null)*: If set, filters episodes by language.
- **Returns:**  
  Array of episode objects:
  ```js
  {
    name: string,
    url: string,
    cover: string,
    language: string,
    episode: string
  }
  ```

---

### `getRandomAnime(source)`
Fetches a random anime from the catalogue.

- **Parameters:**
  - `source` *(string)*: The scraping source (only "animesama" available at the moment)
- **Returns:**  
  An anime object:
  ```js
  {
    name: string,
    altTitles: string[],
    genres: string[],
    url: string,
    cover: string
  }
  ```

---

> ⚠️ This project scrapes data from anime-sama.fr. Use responsibly and respect the site's terms of use.