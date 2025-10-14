import { AnimeScraper } from "../../index.js"; // REPLACE BY "from 'better-ani-scraped';"

const main = async () => {
  const animesama = new AnimeScraper('animesama');
  const scansUrl = "https://anime-sama.fr/catalogue/drcl-midnight-children/scan/vf";
  const scansImgUrl = await animesama.getImgScans(scansUrl, 9);
  console.log("Image scans:", scansImgUrl);
};

main().catch(console.error);
