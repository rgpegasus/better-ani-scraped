# Better-Ani-Scraped Documentation



--- 

## Summary
- [Presentation](#presentation)
- [Main class](#main-class)
- [`AnimeScraper("animesama")` methods](#animescraperanimesama-methods)
- [Utility functions](#utility-functions)

---

## Presentation

A set of utility functions for scraping anime data from multiple sources. This tool allows you to search for anime, retrieve information, get episodes, and more.

##### Supported sources
- [anime-sama](https://anime-sama.to)

---

## Main class

### `AnimeScraper(source)`
Creates a scraper for the given source (only "animesama" are currently available).
```js 
const animesama = new AnimeScraper('animesama') //for Anime Sama
```

---

## `AnimeScraper("animesama")` methods

- [getWorkingUrl](#animesamagetworkingurllisturl--httpsanime-samapw)
- [searchAnime](#animesamasearchanimequery-limit--10-wantedlanguages--vostfr-vf-vastfr-wantedtypes--anime-film-scans-webtoon-autres-wantedpage--1)
- [getSeasons](#animesamagetseasonsanimeurl-wantedlanguages--vostfr-vf-va-vkr-vcn-vqc-vf1-vf2-wantedtypes--anime-kai-scans)
- [getEpisodeTitles](#animesamagetepisodetitlesseasonurl-numberepisode-html--null)
- [getEmbed](#animesamagetembedseasonurl-hostpriority--ansembed-sendvid-smoothpre-uqload-susanexpectcare-allhost--false-includeinfo--false-lazy--false)
- [getAnimeInfo](#animesamagetanimeinfoanimeurl)
- [getAvailableLanguages](#animesamagetavailablelanguagesseasonurl-wantedlanguages--vostfr-vf-va-vkr-vcn-vqc-vf1-vf2-includenumberepisodes--false)
- [getAllAnime](#animesamagetallanimewantedlanguages--vostfr-vf-vastfr-wantedtypes--anime-film-scans-webtoon-autres-wantedpage--null-includeseasons--false)
- [getLatestEpisodes](#animesamagetlatestepisodeswantedlanguages--vostfr-vf-va-vkr-vcn-vqc-vf1-vf2)
- [getLatestScans](#animesamagetlatestscanswantedlanguages--vostfr-vf-va-vkr-vcn-vqc-vf1-vf2)
- [getRandomAnime](#animesamagetrandomanimewantedlanguages--vostfr-vf-vastfr-wantedtypes--anime-film-scans-webtoon-autres-maxattempts--50)
- [getChapterTitles](#animesamagetchaptertitlesmangaurl-includenumberimg--false-includeencodedtitle--false)
- [getImgScans](#animesamagetimgscansmangaurl-wantedchapter-numberimg--null-encodedtitle--null)


### `animesama.getWorkingUrl(listUrl = "https://anime-sama.pw")`
Finds the current working domain of anime-sama by following the main button of the redirect page.

- **Parameters:**
  - `listUrl` *(string)*: URL of the page that lists the current domain.
- **Returns:**  
  The working base URL as a string, without trailing slash (for example `"https://anime-sama.to"`). Throws if the link cannot be found, if the site answers with an error, or after 10 seconds without answer.

> Every other function calls it internally. The result is kept for 30 minutes, you don't need to call it yourself.

---

### `animesama.searchAnime(query, limit = 10, wantedLanguages = ["vostfr", "vf", "vastfr"], wantedTypes = ["Anime", "Film", "Scans", "Webtoon", "Autres"], wantedPage = 1)`
Searches for anime titles that match the given query.

- **Parameters:**
  - `query` *(string)*: The search keyword.
  - `limit` *(number)*: Maximum number of results to return.
  - `wantedLanguages` *(string[])*: Array of wanted languages.
  - `wantedTypes` *(string[])*: Array of wanted types.
  - `wantedPage` *(number)*: The catalog page number. If `0` or `null`, the pages are fetched one after the other until `limit` results are found.
- **Returns:**  
  An array of anime objects:
  ```js
  [
    {
      url: string,
      title: string,
      cover: string,
      types: string[],
      languages: string[],
    },
    ...
  ]
  ```

---

### `animesama.getSeasons(animeUrl, wantedLanguages = ["vostfr", "vf", "va", "vkr", "vcn", "vqc", "vf1", "vf2"], wantedTypes = ["Anime", "Kai", "Scans"])`
Fetches all available seasons of an anime. For each season, the languages are tried in the given order and the first one that exists is kept.

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
      type: string //"Anime", "Kai" or "Scans"
    },
    ...
  ]
  ```

---

### `animesama.getEpisodeTitles(seasonUrl, numberEpisode, html = null)`
Fetches the names of all episodes in a season.

- **Parameters:**
  - `seasonUrl` *(string)*: URL of the anime’s season page.
  - `numberEpisode` *(number)*: The number of episodes in the season.
  - `html` *(string|null)*: The already downloaded HTML of `seasonUrl`. If given, the page is not requested again.
- **Returns:**  
  An array of episode titles.

---

### `animesama.getEmbed(seasonUrl, hostPriority = ["ansembed", "sendvid", "smoothpre", "uqload", "susanexpectcare"], allHost = false, includeInfo = false, lazy = false)`
Retrieves embed URLs for episodes, prioritizing by host.

- **Parameters:**
  - `seasonUrl` *(string)*: URL of the anime’s season page.
  - `hostPriority` *(string[])*: Array of preferred hostnames.
  - `allHost` *(boolean)*: If `true`, fetches all available embeds contained in *hostPriority*.
  - `includeInfo` *(boolean)*: If `true`, also fetches the name and the number of episodes of the season.
  - `lazy` *(boolean)*: If `true`, no link is resolved (no request to `lien.php`). Each episode gets the list of its unresolved links instead, to be resolved later with `resolveLienUrl()` for the episode that is actually played. `hostPriority` and `allHost` are ignored.
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
  - If `lazy = true`, each episode object is (inside the same array or `episodes` array as above):
  ```js
  {
    title: string,
    url: string[], //unresolved lien.php URLs, one per player (use resolveLienUrl)
    host: [], //always empty: the host is only known once the link is resolved
    lazy: true,
  }
  ```
  Throws if the page has no episode token or no episode array.

> Without `lazy`, one request per episode and per player is sent to `lien.php`, at most 3 at the same time. Links that cannot be resolved are ignored, and episodes without any usable host are not returned.

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
    cover: string | null,
    banner: string | null,
    genres: string[],
    synopsis: string,
    malUrl: string,
    similaires: [ //similar anime
      {
        url: string,
        title: string,
        cover: string | null,
        types: string[],
        languages: string[],
      },
      ...
    ]
  }
  ```

---

### `animesama.getAvailableLanguages(seasonUrl, wantedLanguages = ["vostfr", "vf", "va", "vkr", "vcn", "vqc", "vf1", "vf2"], includeNumberEpisodes = false)`
Checks which languages are available for a given anime season.

- **Parameters:**
  - `seasonUrl` *(string)*: URL of the anime's season page.
  - `wantedLanguages` *(string[])*: Array of preferred languages.
  - `includeNumberEpisodes` *(boolean)*: If `true`, also fetches the number of episodes in each language. The episodes are only counted, their links are not resolved.
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
  Else, an array of available languages (lowercase, for example `["vostfr", "vf"]`).

---

### `animesama.getAllAnime(wantedLanguages = ["vostfr", "vf", "vastfr"], wantedTypes = ["Anime", "Film", "Scans", "Webtoon", "Autres"], wantedPage = null, includeSeasons = false)`
Fetches the anime catalog, optionally including season information.

- **Parameters:**
  - `wantedLanguages` *(string[])*: Array of preferred languages.
  - `wantedTypes` *(string[])*: Array of wanted types.
  - `wantedPage` *(number|null)*: The catalog page number. If `0` or `null`, every page of the catalog is fetched (very slow).
  - `includeSeasons` *(boolean)*: If `true`, also fetches seasons for each anime (very slow).
- **Returns:**  
  An array of anime objects if `includeSeasons = false`: 
  ```js
  [
    {
      url: string,
      title: string,
      cover: string,
      types: string[],
      languages: string[],
    },
    ...
  ]
  ```
  Else, an array of anime objects with their seasons (an anime whose seasons cannot be fetched gets an empty `seasons` array): 
  ```js
  [
    {
      url: string,
      title: string,
      cover: string,
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
  When `wantedPage` is `0` or `null`, duplicates are removed. Nothing is written to a file anymore.

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
      cover: string | null,
      types: string[],
      language: string,
      episode: string
    }
  ...
  ]
  ```

---

### `animesama.getLatestScans(wantedLanguages = ["vostfr", "vf", "va", "vkr", "vcn", "vqc", "vf1", "vf2"])`
Scrapes the latest released scans, optionally filtered by language.

- **Parameters:**
  - `wantedLanguages` *(string[])*: Array of preferred languages.
- **Returns:**  
  An array of scans objects:
  ```js
  [
    {
      title: string,
      url: string,
      cover: string | null,
      types: string[],
      language: string,
      chapter: string
    }
  ...
  ]
  ```

---

### `animesama.getRandomAnime(wantedLanguages = ["vostfr", "vf", "vastfr"], wantedTypes = ["Anime", "Film", "Scans", "Webtoon", "Autres"], maxAttempts = 50)`
Fetches a random anime from the catalog.

- **Parameters:**
  - `wantedLanguages` *(string[])*: Array of preferred languages.
  - `wantedTypes` *(string[])*: Array of preferred types.
  - `maxAttempts` *(number|null)* The number of retries if the random anime does not match the filters. If `null`, `50` is used.
- **Returns:**  
  An anime object:
  ```js
  {
    url: string,
    title: string,
    cover: string,
    types: string[],
    languages: string[],
  }
  ```
  Throws if no valid anime is found after `maxAttempts + 1` requests.

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
  Throws if the site does not return the chapter list in the expected format.

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
  An array of image URLs. Throws `"Chapitre introuvable"` if `wantedChapter` does not exist (only checked when `numberImg` or `encodedTitle` is missing).

---

## Utility functions 

- [getVideoUrlFromEmbed](#getvideourlfromembedsource-embedurl)
- [resolveLienUrl](#resolvelienurlurl-referer--url)

### `getVideoUrlFromEmbed(source, embedUrl)`
Retrieves the video URL of the source's embed.

- **Parameters:**
  - `source` *(string)*: The embed source ("sibnet", "sendvid", "vidmoly", "smoothpre", "embed4me", "ansembed" and "uqload" available at the moment). Throws `Unsupported embed source` for any other value.
  - `embedUrl` *(string)*: URL of the embed’s episode page
- **Returns:**  
  A video URL as a string:
  - `sendvid`: mp4 
  - `smoothpre`: m3u8
  - `ansembed` : m3u8
  - `uqload`: m3u8
  - `susanexpectcare` : m3u8
  - `sibnet`: mp4 ***deprecated***
  - `vidmoly`: {*videoUrl*: m3u8, *openingTime*: [ start, end ]} ***deprecated***
  - `oneupload`: m3u8 ***deprecated***
  - `movearnpre`: m3u8 ***deprecated***
  - `embed4me`: m3u8 ***deprecated***

---

### `resolveLienUrl(url, referer = url)`
Resolves a `lien.php` URL (the ones returned by `getEmbed` with `lazy = true`) into the real embed URL, which can then be given to `getVideoUrlFromEmbed`.

- **Parameters:**
  - `url` *(string)*: The `lien.php` URL.
  - `referer` *(string)*: The `Referer` header sent with the request.
- **Returns:**  
  A promise of the embed URL as a string, or `null` if it could not be resolved. It never throws.

> At most 3 requests are sent at the same time, whatever the number of calls. A successful result is kept for 30 minutes and calls for the same URL share the same request. A failure (for example `429 Too Many Requests`) is **not** retried and **not** kept: calling the function again sends a new request.

---

> All requests stop after 15 seconds. Unless stated otherwise, a network or parsing error is thrown to the caller instead of being replaced by an empty result.

> ⚠️ This project scrapes data from online sources. Use at your own risk.