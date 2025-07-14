import { AnimeScraper } from "../../index.js"; // REPLACE BY "from 'better-ani-scraped';"

const main = async () => {
  const animesama = new AnimeScraper('animesama');

  const search = await animesama.searchAnime("gachiakuta", 100, [], ["Anime", "Film", "Autres", "Scans"]);
  console.log("Search Results:", search);
};

main().catch(console.error);
