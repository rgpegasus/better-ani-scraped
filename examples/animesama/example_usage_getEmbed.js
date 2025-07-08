import { AnimeScraper } from "../../index.js"; // REPLACE BY "from 'better-ani-scraped';"

const main = async () => {
  const animesama = new AnimeScraper('animesama');
  const seasonUrl = "https://anime-sama.fr/catalogue/86-eighty-six/saison1/vostfr/";
  
  const embeds = await animesama.getEmbed(seasonUrl, ["sibnet", "vidmoly"], true);
  console.log("Embed Links:", embeds);
};

main().catch(console.error);
