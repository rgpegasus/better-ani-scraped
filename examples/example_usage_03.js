import { AnimeScraper } from "../index.js"; // REPLACE BY "from 'ani-scraped';"

const main = async () => {
  const scraper = new AnimeScraper('animesama');

  await scraper.getAllAnime("output_anime_list.json", false);
};

main().catch(console.error);
