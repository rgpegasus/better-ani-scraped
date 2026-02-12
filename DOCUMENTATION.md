# Better-Ani-Scraped Documentation



--- 

## Summary
- [Presentation](#presentation)
- [Main class](#main-class)
- [`AnimeScraper("animesama")` methods](#animescraperanimesama-methods)
- [`AnimeScraper("animepahe")` methods](#animescraperanimepahe-methods)
- [`AnimeScraper("crunchyroll")` methods](#animescrapercrunchyroll-methods)
- [Utility functions](#utility-functions)

---

## Presentation

A set of utility functions for scraping anime data from multiple sources. This tool allows you to search for anime, retrieve information, get episodes, and more.

##### Supported sources
- [anime-sama](https://anime-sama.tv)
- [animepahe](https://animepahe.si) 
- [crunchyroll](https://www.crunchyroll.com/fr)

---

## Main class

### `AnimeScraper(source)`
Creates a scraper for the given source (only "animesama", "animepahe", and "crunchyroll" are currently available).
```js 
const animesama = new AnimeScraper('animesama') //for Anime Sama
const animepahe = new AnimeScraper('animepahe') //for Anime Pahe
const crunchyroll = new AnimeScraper('crunchyroll') //for Crunchyroll
```

---

## `AnimeScraper("animesama")` methods

- [searchAnime](#animesamasearchanimequery-limit--10-wantedlanguages--vostfr-vf-vastfr-wantedtypes--anime-film-scans-autres-wantedpage--1)
- [getSeasons](#animesamagetseasonsanimeurl-wantedlanguages--vostfr-vf-va-vkr-vcn-vqc-vf1-vf2-wantedtypes--anime-kai-scans)
- [getEpisodeTitles](#animesamagetepisodetitlesseasonurl-customchromiumpath)
- [getEmbed](#animesamagetembedseasonurl-hostpriority--sendvid-sibnet-vidmoly-oneupload-allhost--false-includeinfo--false-customchromiumpath)
- [getAnimeInfo](#animesamagetanimeinfoanimeurl)
- [getAvailableLanguages](#animesamagetavailablelanguagesseasonurl-wantedlanguages--vostfr-vf-va-vkr-vcn-vqc-vf1-vf2-includenumberepisodes--false-customchromiumpath)
- [getAllAnime](#animesamagetallanimewantedlanguages--vostfr-vf-vastfr-wantedtypes--anime-film-scans-autres-wantedpage--0-includeseasons--false-output--anime_listjson)
- [getLatestEpisodes](#animesamagetlatestepisodeswantedlanguages--vostfr-vf-va-vkr-vcn-vqc-vf1-vf2)
- [getLatestScans](#animesamagetlatestscanswantedlanguages--vostfr-vf-va-vkr-vcn-vqc-vf1-vf2)
- [getRandomAnime](#animesamagetrandomanimewantedlanguages--vostfr-vf-vastfr-wantedtypes--anime-film-scans-autres-maxattempts--null-attempt--0)
- [getChapterTitles](#animesamagetchaptertitlesmangaurl-includenumberimg--false-includeencodedtitle--false)
- [getImgScans](#animesamagetimgscansmangaurl-wantedchapter-numberimg--null-encodedtitle--null)


### `animesama.searchAnime(query, limit = 10, wantedLanguages = ["vostfr", "vf", "vastfr"], wantedTypes = ["Anime", "Film", "Scans", "Autres"], wantedPage = 1)`
Searches for anime titles that match the given query.

- **Parameters:**
  - `query` *(string)*: The search keyword.
  - `limit` *(number)*: Maximum number of results to return.
  - `wantedLanguages` *(string[])*: Array of wanted languages.
  - `wantedTypes` *(string[])*: Array of wanted types.
  - `wantedPage` *(number)*: The catalog page number.
- **Returns:**  
  An array of anime objects:
  ```js
  [
    {
      url: string,
      title: string,
      altTitles: string[],
      cover: string,
      synopsis: string,
      genres: string[],
      types: string[],
      languages: string[],
    },
    ...
  ]
  ```

---

### `animesama.getSeasons(animeUrl, wantedLanguages = ["vostfr", "vf", "va", "vkr", "vcn", "vqc", "vf1", "vf2"], wantedTypes = ["Anime", "Kai", "Scans"])`
Fetches all available seasons of an anime in the first valid language specified.

- **Parameters:**
  - `animeUrl` *(string)*: URL of the anime’s page.
  - `wantedLanguages` *(string[])*: Array of preferred languages.
  - `wantedTypes` *(string[])*: Array of preferred types.
- **Returns:**  
  An array of season objects:
  ```js
  [
    { 
      title: string, 
      url: string,
      language: string,
      type: string
    },
    ...
  ]
  ```

---

### `animesama.getEpisodeTitles(seasonUrl, customChromiumPath)`
Fetches the names of all episodes in a season.

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
  - `allHost` *(boolean)*: If `true`, fetches all available embeds contained in *hostPriority*.
  - `includeInfo` *(boolean)*: If `true`, also fetches the name and the number of episodes of the season.
  - `customChromiumPath` *(string)*: Path of the Chromium folder.
- **Returns:**  
  - An array of embed video object if `includeInfo = false`:
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
  - An object of embed video data if `includeInfo = true`:
  ```js
  {
    episodes: [
      {
        title: string,
        url: string, //string[] if allHost = true
        host: string, //string[] if allHost = true
      },
      ...
    ]
    animeInfo: {
      seasonTitle: string,
      episodeCount:number,
    }
  }

  ```
---

### `animesama.getAnimeInfo(animeUrl)`
Extracts basic information from an anime page.

- **Parameters:**
  - `animeUrl` *(string)*: URL of the anime's page.
- **Returns:**  
  An object of anime data:
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

### `animesama.getAvailableLanguages(seasonUrl, wantedLanguages = ["vostfr", "vf", "va", "vkr", "vcn", "vqc", "vf1", "vf2"], includeNumberEpisodes = false, customChromiumPath)`
Checks which languages are available for a given anime season.

- **Parameters:**
  - `seasonUrl` *(string)*: URL of the anime's season page.
  - `wantedLanguages` *(string[])*: Array of preferred languages.
  - `includeNumberEpisodes` *(boolean)*: If `true`, also fetches the number of episodes in each language.
  - `customChromiumPath` *(string)*: Path of the Chromium folder. Useless if `includeNumberEpisodes = false`.
- **Returns:**  
  An array of objects containing available languages and their episode count if `includeNumberEpisodes = true`:
  ```js
  [
    {
      language: string,
      episodeCount: number 
    },
    ...
  ]
  ```
  Else, an array of available languages
---

### `animesama.getAllAnime(wantedLanguages = ["vostfr", "vf", "vastfr"], wantedTypes = ["Anime", "Film", "Scans", "Autres"], wantedPage = 0, includeSeasons = false, output = "anime_list.json")`
Fetches the full anime catalog, optionally including season information.

- **Parameters:**
  - `wantedLanguages` *(string[])*: Array of preferred languages.
  - `wantedTypes` *(string[])*: Array of wanted types.
  - `wantedPage` *(number)*: The catalog page number.
  - `includeSeasons` *(boolean)*: If `true`, also fetches seasons for each anime (very slow).
  - `output` *(string)*: File name to save the result as JSON.  Useless if `wantedPage > 0`.
- **Returns:**  
  An array of anime objects if `page > 0` and `includeSeasons = false`: 
  ```js
  [
    {
      url: string,
      title: string,
      altTitles: string[],
      cover: string,
      synopsis: string,
      genres: string[],
      types: string[],
      languages: string[],
    },
    ...
  ]
  ```
  Else, An array of anime objects if `page > 0` and `includeSeasons = true`: 
  ```js
  [
    {
      url: string,
      title: string,
      altTitles: string[],
      cover: string,
      synopsis: string,
      genres: string[],
      types: string[],
      languages: string[],
      seasons: [
        { 
          title: string, 
          url: string,
          language: string,
          type: string
        },
        ...
      ]
    },
    ...
  ]
  ```
  Else, `true` if the json file creation was successful, `false` otherwise.

---

### `animesama.getLatestEpisodes(wantedLanguages = ["vostfr", "vf", "va", "vkr", "vcn", "vqc", "vf1", "vf2"])`
Scrapes the latest released episodes, optionally filtered by language.

- **Parameters:**
  - `wantedLanguages` *(string[])*: Array of preferred languages.
- **Returns:**  
  An array of episode objects:
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

### `animesama.getLatestScans(wantedLanguages = ["vostfr", "vf", "va", "vkr", "vcn", "vqc", "vf1", "vf2"])`
Scrapes the latest released episodes, optionally filtered by language.

- **Parameters:**
  - `wantedLanguages` *(string[])*: Array of preferred languages.
- **Returns:**  
  An array of scans objects:
  ```js
  [
    {
      title: string,
      url: string,
      cover: string,
      type: string,
      language: string,
      chapter: string
    }
  ...
  ]
  ```

---

### `animesama.getRandomAnime(wantedLanguages =  ["vostfr", "vf", "vastfr"], wantedTypes = ["Anime", "Film", "Scans", "Autres"], maxAttempts = null, attempt = 0)`
Fetches a random anime from the catalog.

- **Parameters:**
  - `wantedLanguages` *(string[])*: Array of preferred languages.
  - `wantedTypes` *(string[])*: Array of preferred types.
  - `maxAttempts` *(number|null)* The number of attempts of the function. If `null`, retry until a result is obtained.
  - `attempt` *(number)* Current number of attempts. (***leave empty***)
- **Returns:**  
  An anime object:
  ```js
  {
    url: string,
    title: string,
    altTitles: string[],
    cover: string,
    synopsis: string,
    genres: string[],
    types: string[],
    languages: string[],
  }
  ```

---

### `animesama.getChapterTitles(mangaUrl, includeNumberImg = false, includeEncodedTitle = false)`
Fetches the names of all chapters in a manga.

- **Parameters:**
  - `mangaUrl` *(string)*: URL of the anime’s manga page.
  - `includeNumberImg` *(boolean)*: If `true`, indicates the number of images in each chapter.
  - `includeEncodedTitle` *(boolean)*: If `true`, specify the name of the manga. 
- **Returns:**  
  
  - An object of chapter data if `includeNumberImg = true` && `includeEncodedTitle = true`:
  ```js
  {
    scans: [
      {
        numberImg: number, //This value can be used for animesama.getImgScans(mangaUrl, wantedChapter)
        title: string, 
      }
      ...
    ]
    encodedTitle: string, //This value can be used for animesama.getImgScans(mangaUrl, wantedChapter)
  }
  ```
  - An object of chapter data if `includeNumberImg = false` && `includeEncodedTitle = true`: 
  ```js
  {
    scans: [
      title: string, 
      ...
    ]
    encodedTitle: string, //This value can be used for animesama.getImgScans(mangaUrl, wantedChapter)
  }
  ```
  - An array of chapter data if `includeNumberImg = true` && `includeEncodedTitle = false`: 
  ```js
  [
    {
      numberImg: number, //This value can be used for animesama.getImgScans(mangaUrl, wantedChapter)
      title: string, 
    }
    ...
  ]
  ```
  - An array of chapter titles if `includeNumberImg = false` && `includeEncodedTitle = false`: 
  ```js
  [
    title: string, 
    ...
  ]
  ```
---

### `animesama.getImgScans(mangaUrl, wantedChapter, numberImg = null, encodedTitle = null)`
Fetches the images of a chapter.

- **Parameters:**
  - `mangaUrl` *(string)*: URL of the anime’s manga page.
  - `wantedChapter` *(number)*: The number of the chapter you want. You need to use an id (for example `"chapter 1" -> 0`)
  - `numberImg` *(number|null)*: The maximum number of images in the chapter. It must come from the result value of `numberImg` from `animesama.getChapterTitles()`
  - `encodedTitle` *(string|null)*: The encoded URI component of the manga title. It must come from the result value of `encodedTitle` from `animesama.getChapterTitles()`
>  `numberImg` and `encodedTitle` are recalculated internally if missing. Using both values improves performance by avoiding redundant computations.
- **Returns:**  
  An array of image URLs.

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
  - `limit` *(number)*: Maximum number of results to return.
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
  - `animeUrl` *(string)*: URL of the anime’s page.
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
  - `source` *(string)*: The embed source (only "sibnet", "sendvid", "vidmoly", "oneupload", "movearnpre" and "smoothpre" available at the moment)
  - `embedUrl` *(string)*: URL of the embed’s episode page
- **Returns:**  
  A video URL as a string:
  - `sibnet`: mp4
  - `sendvid`: mp4
  - `vidmoly`: m3u8 ***deprecated***
  - `oneupload`: m3u8
  - `movearnpre`: m3u8 ***deprecated***
  - `smoothpre`: m3u8

---


> ⚠️ This project scrapes data from online sources. Use at your own risk.
