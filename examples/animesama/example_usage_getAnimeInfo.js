import { AnimeScraper } from "../../index.js"; // REPLACE BY "from 'better-ani-scraped';"

const main = async () => {
  const animesama = new AnimeScraper('animesama');
  const BASE_URL = await animesama.getWorkingUrl()
  const animeUrl = `${BASE_URL}/catalogue/86-eighty-six/`;
  
  const animeInfo = await animesama.getAnimeInfo(animeUrl);
  console.log("Anime Info: ", animeInfo);
};

main().catch(console.error);
