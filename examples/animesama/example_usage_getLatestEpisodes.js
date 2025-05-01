import { AnimeScraper } from "../../index.js"; // REPLACE BY "from 'better-ani-scraped';"

const main = async () => {
  const animesama = new AnimeScraper('animesama');

  const new_episodes = await animesama.getLatestEpisodes(["vostfr", "vf"]);
  console.log(new_episodes);
};

main().catch(console.error);
