import { AnimeScraper, getVideoUrlFromEmbed } from "../../index.js"; // REPLACE BY "from 'better-ani-scraped';"

const main = async () => {
  const animesama = new AnimeScraper('animesama');
  const animeUrl = "https://anime-sama.fr/catalogue/86-eighty-six/";
  
  const seasons = await animesama.getSeasons(animeUrl, "vostfr");
  console.log("Seasons:", seasons);
};

main().catch(console.error);
