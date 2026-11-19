import { AnimeScraper, utilityFunctions } from "../../index.js";

const main = async () => {
  const animesama = new AnimeScraper('animesama');
  const BASE_URL = await animesama.getWorkingUrl();
  const animeUrl = `${BASE_URL}/catalogue/one-piece/`;

  const seasons = await utilityFunctions.debug(() => animesama.getSeasons(animeUrl, ["vostfr", "vf"], ["Anime", "Scans"]));
  console.log("Seasons: ", seasons);
};

main().catch(console.error);