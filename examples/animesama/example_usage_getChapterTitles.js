import { AnimeScraper } from "../../index.js"; // REPLACE BY "from 'better-ani-scraped';"

const main = async () => {
  const animesama = new AnimeScraper('animesama');
  const BASE_URL = await animesama.getWorkingUrl();
  const mangaUrl = `${BASE_URL}/catalogue/one-piece/scan_noir-et-blanc/vf/`;
  
  const chapterTitles = await animesama.getChapterTitles(mangaUrl, true, true);
  console.log("Titles: ", chapterTitles);
};

main().catch(console.error);
