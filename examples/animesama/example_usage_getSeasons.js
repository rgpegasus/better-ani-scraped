import { AnimeScraper } from "../../index.js"; // REPLACE BY "from 'better-ani-scraped';"

const main = async () => {
  const animesama = new AnimeScraper('animesama');
  const animeUrl = "https://anime-sama.fr/catalogue/sword-art-online";
  
  const seasons = await animesama.getSeasons(animeUrl, ["vostfr", "vf"]);
  console.log("Seasons:", seasons);
};

main().catch(console.error);
