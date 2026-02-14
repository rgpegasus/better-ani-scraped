import { AnimeScraper } from "../../index.js"; // REPLACE BY "from 'better-ani-scraped';"

const main = async () => {
  const animesama = new AnimeScraper('animesama');
  const BASE_URL = await animesama.getWorkingUrl();
  const mangaUrl = `https://anime-sama.tv/catalogue/jujutsu-kaisen/scan/vf/`;
  
  const chapterTitles = await animesama.getChapterTitles(mangaUrl, false, false);
  console.log("Titles: ", chapterTitles);
};

main().catch(console.error);
