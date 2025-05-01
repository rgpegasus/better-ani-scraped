import { AnimeScraper } from "../../index.js"; // REPLACE BY "from 'better-ani-scraped';"

const main = async () => {
  const animesama = new AnimeScraper('animesama');
  const seasonUrl = "https://anime-sama.fr/catalogue/86-eighty-six/saison1/vostfr/";
  
  const episodeTitles = await animesama.getEpisodeTitles(seasonUrl);
  console.log("Episode Titles:", episodeTitles);
};

main().catch(console.error);
