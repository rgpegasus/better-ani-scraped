import { AnimeScraper } from "../../index.js"; // REPLACE BY "from 'better-ani-scraped';"

const main = async () => {
  const animesama = new AnimeScraper("animesama");

  const newScans = await animesama.getLatestScans(["vostfr", "vf"]);
  console.log("Latest Scans: ",newScans);
};

main().catch(console.error);
