import { AnimeScraper } from "../../index.js"; // REPLACE BY "from 'better-ani-scraped';"

const main = async () => {
  const animesama = new AnimeScraper("animesama");
  const BASE_URL = await animesama.getWorkingUrl();
  const scansUrl = `${BASE_URL}/catalogue/hajime-no-ippo/scan/vf/`;
  console.time("Temps récupération scans");
  const scansImgUrl = await animesama.getImgScans(scansUrl, 0, 12, "Hajime%20no%20Ippo");
  console.log("Images Scans: ", scansImgUrl);
};

main().catch(console.error);
 