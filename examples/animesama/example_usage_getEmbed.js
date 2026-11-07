import { AnimeScraper } from "../../index.js"; // REPLACE BY "from 'better-ani-scraped';"

const main = async () => {
  const animesama = new AnimeScraper('animesama');
  const BASE_URL = await animesama.getWorkingUrl();
  const seasonUrl = `${BASE_URL}/catalogue/jojos-bizarre-adventure/saison1/vf`;
  
  const embeds = await animesama.getEmbed(seasonUrl, ["sendvid", "smoothpre", "ansembed", "uqload"], true, false);
  console.log("Embed Links: ", JSON.stringify(embeds, null, 2));

};

main().catch(console.error);
