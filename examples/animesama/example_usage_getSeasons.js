import { AnimeScraper } from "../../index.js"; // REPLACE BY "from 'better-ani-scraped';"

const main = async () => {
  const animesama = new AnimeScraper('animesama');
  const animeUrl = "https://anime-sama.fr/catalogue/drcl-midnight-children";
  
  const seasons = await animesama.getSeasons(animeUrl, ["vostfr", "vf"], ["Anime", "Scans"]);
  console.log("Seasons:", seasons);
};

main().catch(console.error);
