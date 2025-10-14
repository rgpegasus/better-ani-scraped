import { AnimeScraper } from "../../index.js"; // REPLACE BY "from 'better-ani-scraped';"

const main = async () => {
  const animesama = new AnimeScraper('animesama');
  const mangaUrl = "https://anime-sama.fr/catalogue/drcl-midnight-children/scan/vf";
  const chapterTitles = await animesama.getAllTitleScans(mangaUrl, true);
  console.log("Titles:", chapterTitles);
};

main().catch(console.error);
