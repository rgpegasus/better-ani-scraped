import { AnimeScraper } from "../../index.js"; // REPLACE BY "from 'better-ani-scraped';"

const main = async () => {
  const animesama = new AnimeScraper('animesama');
  const seasonUrl = "https://anime-sama.fr/catalogue/solo-leveling/saison1/vostfr/";
  
  const embeds = await animesama.getEmbed(seasonUrl, ["sibnet", "vidmoly", "sendvid"], true, true);

console.log("Embed Links:", JSON.stringify(embeds, null, 2));

};

main().catch(console.error);
