import { AnimeScraper } from "../index.js"; // REPLACE BY "from 'ani-scraped';"

const main = async () => {
  const scraper = new AnimeScraper('animesama');

  const new_episodes = await scraper.getLatestEpisodes("vostfr");
  console.log(new_episodes);

  const random_episode = await scraper.getRandomAnime();
  console.log(random_episode);
};

main().catch(console.error);
