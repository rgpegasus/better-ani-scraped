import { AnimeScraper } from "../../index.js"; // REPLACE BY "from 'better-ani-scraped';"

const main = async () => {
  const animesama = new AnimeScraper('animesama');

  const catalogue = await animesama.getAllAnime(["vostfr", "vf", "vastfr"], ["Anime", "Film"], 2);
  console.log(catalogue)
};

main().catch(console.error);
