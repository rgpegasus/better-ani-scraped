import { AnimeScraper } from "../../index.js"; // REPLACE BY "from 'better-ani-scraped';"

const main = async () => {
    const crunchyroll = new AnimeScraper('crunchyroll');
    const animeUrl = "https://www.crunchyroll.com/fr/series/GVDHX8DM5/86-eighty-six/";

    const episodeInfo = await crunchyroll.getEpisodeInfo(animeUrl, "S2")
    console.log("Episode Info:", episodeInfo)
  };
  
  main().catch(console.error);
  