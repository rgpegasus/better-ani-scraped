import { AnimeScraper } from "../../index.js"; // REPLACE BY "from 'better-ani-scraped';"

const main = async () => {
  const animesama = new AnimeScraper('animesama');
  const BASE_URL = await animesama.getWorkingUrl();
  const seasonUrl = `${BASE_URL}/catalogue/one-piece/saison11/vostfr`;
  
  const embeds = await animesama.getEmbed(seasonUrl, ["smoothpre", "sibnet", "vidmoly", "sendvid"], true, true);
  console.log("Embed Links: ", JSON.stringify(embeds, null, 2));

};

main().catch(console.error);
