import { AnimeScraper } from "../../index.js"; // REPLACE BY "from 'better-ani-scraped';"

const main = async () => {
  const animesama = new AnimeScraper('animesama');
  const BASE_URL = await animesama.getWorkingUrl();
  const seasonUrl = `${BASE_URL}/catalogue/tsue-to-tsurugi-no-wistoria/saison2/vostfr/`;
  
  const episodeTitles = await animesama.getEpisodeTitles(seasonUrl, 7);
  console.log("Episode Titles:", episodeTitles);
};

main().catch(console.error);
