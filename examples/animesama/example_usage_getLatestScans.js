import { AnimeScraper } from "../../index.js"; // REPLACE BY "from 'better-ani-scraped';"

const main = async () => {
  const animesama = new AnimeScraper("animesama");

  const new_scans = await animesama.getLatestScans(["vostfr", "vf"]);
  console.log(new_scans);
};

main().catch(console.error);
