,,,,# Better-Ani-Scraped Documentation

A set of utility functions for scraping anime data from multiple sources (only [anime-sama](https://anime-sama.fr) and [animepahe](https://animepahe.ru) available at the moment). This tool allows you to search for anime, retrieve information, get episodes, and more.

--- 

## Summary
- [Main class](#main-class)
- [`AnimeScraper("animesama")` methods](#animescraperanimesama-methods)
- [`AnimeScraper("animepahe")` methods](#animescraperanimepahe-methods)
- [`AnimeScraper("crunchyroll")` methods](#animescrapercrunchyroll-methods)
- [Utility functions](#utility-functions)

---

## Main class

### `AnimeScraper(source)`
Creates a scraper for the given source (only "animesama", "animepahe" and "crunchyroll" available at the moment).
```js 
const animesama = new AnimeScraper('animesama') //for Anime Sama
const animepahe = new AnimeScraper('animepahe') //for Anime Pahe
const crunchyroll = new AnimeScraper('crunchyroll') //for Crunchyroll
```

---

## `AnimeScraper("animesama")` methods

- [searchAnime](#animesamasearchanimequery-limit--10-wantedlanguages--vostfr-vf-vastfr-wantedtypes--anime-film-page--null)
- [getSeasons](#animesamagetseasonsanimeurl-language--vostfr-vf-va-vkr-vcn-vqc-vf1-vf2)
- [getEpisodeTitles](#animesamagetepisodetitlesseasonurl-customchromiumpath)
- [getEmbed](#animesamagetembedseasonurl-hostpriority--sendvid-sibnet-vidmoly-oneupload-allhost--false-includeinfo--false-customchromiumpath)
- [getAnimeInfo](#animesamagetanimeinfoanimeurl)
- [getAvailableLanguages](#animesamagetavailablelanguagesseasonurl-wantedlanguages--vostfr-vf-va-vkr-vcn-vqc-vf1-vf2-numberepisodes--false)
- [getAllAnime](#animesamagetallanimewantedlanguages--vostfr-vf-vastfr-wantedtypes--anime-film-page--null-output--anime_listjson-get_seasons--false)
- [getLatestEpisodes](#animesamagetlatestepisodeslanguagefilter--null)
- [getRandomAnime](#animesamagetrandomanimewantedlanguages--vostfr-vf-vastfr-wantedtypes--anime-film-maxattempts--null-attempt--0)

### `animesama.searchAnime(query, limit = 10, wantedLanguages = ["vostfr", "vf", "vastfr"], wantedTypes = ["Anime", "Film"], page = null)`
Searches for anime titles that match the given query.

- **Parameters:**
  - `query` *(string)*: The search keyword.
  - `limit` *(number)*: Maximum number of results to return (default: 10).
  - `wantedLanguages` *(string[])*: Array of wanted languages.
  - `wantedTypes` *(string[])*: Array of wanted types.
  - `page` *(number)*: The catalog page number.
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

### `animesama.getSeasons(animeUrl, languagePriority = ["vostfr", "vf", "va", "vkr", "vcn", "vqc", "vf1", "vf2"])`
Fetches all available seasons of an anime in the first valid language specified.

- **Parameters:**
  - `animeUrl` *(string)*: The full URL of the anime.
  - `languagePriority` *(string[])*: Array of preferred language.
- **Returns:**  
  Either an array of season objects:
  ```js
  {
    language: string,
    seasons: [
      { 
        title: string, 
        url: string 
      },
      ...
    ]
  }
  
  ```
  Else, an error object if the language is not available.

---

### `animesama.getEpisodeTitles(seasonUrl, customChromiumPath)`
Fetches the names of all episodes in a season

- **Parameters:**
  - `seasonUrl` *(string)*: URL of the anime’s season page.
  - `customChromiumPath` *(string)*: Path of the Chromium folder
- **Returns:**  
  An array of episode titles.

---

### `animesama.getEmbed(seasonUrl, hostPriority = ["sendvid", "sibnet", "vidmoly", "oneupload"], allHost = false, includeInfo = false, customChromiumPath)`
Retrieves embed URLs for episodes, prioritizing by host.

- **Parameters:**
  - `seasonUrl` *(string)*: URL of the anime’s season page.
  - `hostPriority` *(string[])*: Array of preferred hostnames.
  - `allHost` *(boolean)*: If `true`, fetches all available embeds contained in *hostPriority*
  - `includeInfo` *(boolean)*: If `true`, also fetches the name of the season and the number of episodes in it
  - `customChromiumPath` *(string)*: Path of the Chromium folder
- **Returns:**  
  An array of embed video if *includeInfo = false* :
  ```js
  [
    {
      title: string,
      url: string, //string[] if allHost = true
      host: string, //string[] if allHost = true
    },
    ...
  ]
  ```
  Else : 
  ```js
  {
    episodes :
    [
      {
        title: string,
        url: string, //string[] if allHost = true
        host: string, //string[] if allHost = true
      },
      ...
    ]
    animeInfo : {
      seasonTitle: string,
      episodeCount:number,
    }
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

### `animesama.getAvailableLanguages(seasonUrl, wantedLanguages = ["vostfr", "vf", "va", "vkr", "vcn", "vqc", "vf1", "vf2"], numberEpisodes = false)`
Checks which languages are available for a given anime season (Avoid using `numberEpisodes = true`, as checking many languages significantly increases execution time).

- **Parameters:**
  - `seasonUrl` *(string)*: The season anime URL.
  - `wantedLanguages` *(string[])*: Language codes to check (e.g., ["vostfr", "vf", "va", ...]).
  - `numberEpisodes` *(boolean)*: If `true`, also fetches the number of episodes in each language.
- **Returns:**  
  Array of objects containing available languages and their episode count if numberEpisodes is true:
  ```js
  [
    {
      language: string,
      episodeCount: number 
    },
    ...
  ]
  ```
  Or an array of available languages
---

### `animesama.getAllAnime(wantedLanguages = ["vostfr", "vf", "vastfr"], wantedTypes = ["Anime", "Film"], page = null, output = "anime_list.json", get_seasons = false)`
Fetches the full anime catalog, optionally including season information.

- **Parameters:**
  - `wantedLanguages` *(string[])*: Language videos to get.
  - `wantedTypes` *(string[])*: Types videos to get.
  - `page` *(number)*: The catalog page number.
  - `output` *(string)*: File name to save the result as JSON.
  - `get_seasons` *(boolean)*: If `true`, also fetches seasons for each anime (very slow, ETA is still unknown).
- **Returns:**  
  if `page = null`, `true` if successful, `false` otherwise.
  else, an array of anime objects :
  ```js
  [
    {
      url: string,
      title: string,
      altTitles: string[],
      cover: string,
      genres: string[],
      types: string[],
      languages: string[],
    },
    ...
  ]
  ```

---

### `animesama.getLatestEpisodes(languageFilter = null)`
Scrapes the latest released episodes, optionally filtered by language.

- **Parameters:**
  - `languageFilter` *(string[]|null)*: If set, filters episodes by language in the array. If null, returns all episodes. 
- **Returns:**  
  Array of episode objects:
  ```js
  [
    {
      title: string,
      url: string,
      cover: string,
      language: string,
      episode: string
    }
  ...
  ]
  ```

---

### `animesama.getRandomAnime(wantedLanguages = ["vostfr", "vf", "vastfr"], wantedTypes = ["Anime", "Film"], maxAttempts = null, attempt = 0)`
Fetches a random anime from the catalogue.

- **Parameters:**
  - `wantedLanguages` *(string[])*: Language videos to get.
  - `wantedTypes` *(string[])*: Types videos to get.
  - `maxAttempts` *(number|null)* The number of attempts of the function. If null, retry until a result is obtained.
  - `attempt` *(number)* Current number of attempts (leave empty).
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


## `AnimeScraper("animepahe")` methods

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
      id: number,
      title: string,
      type: string,
      episodes: number,
      status: string,
      season: string,
      year: number,
      score: float,
      session: string,
      cover: string,
      url: string
    },
    ...
  ]
  ```

---

## `AnimeScraper("crunchyroll")` methods

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

## Utility functions 

- [getVideoUrlFromEmbed](#getvideourlfromembedsource-embedurl)

### `getVideoUrlFromEmbed(source, embedUrl)`
Retrieves the video URL of the source's embed.

- **Parameters:**
  - `source` *(string)*: The embed source (only "sibnet", "sendvid", "vidmoly" and "oneupload" available at the moment)
  - `embedUrl` *(string)*: The embed url of the given source.
- **Returns:**  
  A video URL as a string :
  - `sibnet`: mp4
  - `sendvid`: mp4
  - `vidmoly`: m3u8
  - `oneupload`: m3u8

---
---
---
---

> ⚠️ This project scrapes data from online sources. Use at your own risk.
