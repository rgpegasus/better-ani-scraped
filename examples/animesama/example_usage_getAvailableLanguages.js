import { AnimeScraper } from "../../index.js"; // REPLACE BY "from 'better-ani-scraped';"

const main = async () => {
  const animesama = new AnimeScraper('animesama');
  const seasonUrl = "https://anime-sama.fr/catalogue/aggretsuko/saison1/vf/";

  const animeLanguages = await animesama.getAvailableLanguages(seasonUrl, ["vostfr", "vf", "va", "vkr","vcn", "vqc", "vf1", "vf2"], false);
  console.log(animeLanguages);
};

main().catch(console.error);
