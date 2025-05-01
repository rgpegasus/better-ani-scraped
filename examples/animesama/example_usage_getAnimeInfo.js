import { AnimeScraper } from "../../index.js"; // REPLACE BY "from 'better-ani-scraped';"

const main = async () => {
  const animesama = new AnimeScraper('animesama');
  const animeUrl = "https://anime-sama.fr/catalogue/86-eighty-six/";

  const animeInfo = await animesama.getAnimeInfo(animeUrl);
  console.log(animeInfo);
};

main().catch(console.error);
