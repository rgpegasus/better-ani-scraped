# Ani-Scraped
Scrape anime data from different sources (only anime-sama.fr for the moment)

## Install
```
npm install ani-scraped
```
To update the package run: `npm update --save`.

## Example usage
View files in the `examples` folder.

At the head of your file, start by importing the necessary classes
```js
import { searchAnime, getSeasons, getEmbed } from 'ani-scraped';
```
- Search for anime urls
```js
// This searches "sword art online" on anime-sama with a maximum of 3 results.
const search = await searchAnime('animesama', 'sword art online', 3);
console.log('🔍 Search Results:', search);
```
- Get the seasons of from an anime url
```js
const seasons = await getSeasons('animesama', "https://anime-sama.fr/catalogue/sword-art-online/");
console.log('📺 Seasons:', seasons);
```
- Get all embed links from an anime season
```js
// Returns all anime-sama embed links from the URL, prioritizing sibnet over vidmoly.
const embeds = await getEmbed('animesama', "https://anime-sama.fr/catalogue/sword-art-online/saison1/vostfr", ['sibnet', 'vidmoly']);
console.log('🎬 Embed Links:', embeds);
```

## TODO
- Add a function that lists all anime (like searchAnime but for all available animes on the platform).

___

### Special thanks to
- [RG Pegasus](https://github.com/rgpegasus)