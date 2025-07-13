import { AnimeScraper } from "../../index.js"; // REPLACE BY "from 'better-ani-scraped';"

const main = async () => {
  const animesama = new AnimeScraper('animesama');
  const animeUrl = "https://anime-sama.fr/catalogue/aggretsuko/";
  
  const seasons = await animesama.getSeasons(animeUrl, );
  console.log("Seasons:", seasons);
};

main().catch(console.error);
