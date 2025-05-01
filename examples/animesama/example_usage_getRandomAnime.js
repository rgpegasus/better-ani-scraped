import { AnimeScraper } from "../../index.js"; // REPLACE BY "from 'better-ani-scraped';"

const main = async () => {
  const animesama = new AnimeScraper('animesama');

  const random_episode = await animesama.getRandomAnime(["vostfr", "vf", "vastfr"], ["Anime", "Film"], 10);
  console.log(random_episode);
};

main().catch(console.error);
