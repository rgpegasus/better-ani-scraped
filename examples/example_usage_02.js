import { AnimeScraper } from "../index.js"; // REPLACE BY "from 'ani-scraped';"

const main = async () => {
  const scraper = new AnimeScraper('animesama');

  const animeUrl = "https://anime-sama.fr/catalogue/sword-art-online";
  const animeInfo = await scraper.getAnimeInfo(animeUrl);
  console.log(animeInfo);

  const animeLanguages = await scraper.getAvailableLanguages(animeUrl, ["vf"]);
  console.log(animeLanguages);
};

main().catch(console.error);
