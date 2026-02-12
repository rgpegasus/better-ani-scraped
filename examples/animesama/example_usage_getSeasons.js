import { AnimeScraper } from "../../index.js"; // REPLACE BY "from 'better-ani-scraped';"

const main = async () => {
  const animesama = new AnimeScraper('animesama');
  const BASE_URL = await animesama.getWorkingUrl();
  const animeUrl = `${BASE_URL}/catalogue/tougen-anki/`;
  
  const seasons = await animesama.getSeasons(animeUrl, ["vostfr", "vf"], ["Anime", "Scans"]);
  console.log("Seasons: ", seasons);
};

main().catch(console.error);
