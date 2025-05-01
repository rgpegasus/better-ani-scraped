import { AnimeScraper } from "../../index.js"; // REPLACE BY "from 'better-ani-scraped';"

const main = async () => {
  const animepahe = new AnimeScraper('animepahe');

  const search = await animepahe.searchAnime("86");
  console.log("Search Results:", search);
};

main().catch(console.error);
