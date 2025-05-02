import { AnimeScraper } from "../../index.js"; // REPLACE BY "from 'better-ani-scraped';"

const main = async () => {
  const animesama = new AnimeScraper('animesama');

  const search = await animesama.searchAnime("a", 100, ["vostfr", "vf", "vastfr"], ["Anime", "Film"], 2);
  console.log("Search Results:", search);
};

main().catch(console.error);
