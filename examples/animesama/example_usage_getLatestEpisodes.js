import { AnimeScraper } from "../../index.js"; // REPLACE BY "from 'better-ani-scraped';"

const main = async () => {
  const animesama = new AnimeScraper('animesama');

  const newEpisodes = await animesama.getLatestEpisodes(["vostfr", "vf"]);
  console.log("Latest Episodes: ", newEpisodes);
};
 
main().catch(console.error);
