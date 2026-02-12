import { AnimeScraper } from "../../index.js"; // REPLACE BY "from 'better-ani-scraped';"

const main = async () => {
  const animesama = new AnimeScraper('animesama');

  const randomEpisode = await animesama.getRandomAnime(["vostfr", "vf"], ["Anime", "Film", "Scans"], 10);
  console.log("Random Episode: ",randomEpisode);
};

main().catch(console.error);
