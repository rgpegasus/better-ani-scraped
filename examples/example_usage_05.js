import { AnimeScraper } from "../index.js"; // REPLACE BY "from 'better-ani-scraped';"

const main = async () => {
    const scraper = new AnimeScraper('crunchyroll');
    const search = await scraper.searchAnime("86");
    console.log("Search Results:", search);
    
    const episodeInfo = await scraper.getEpisodeInfo(search[0].url, "S2")
    console.log("Episode Info:", episodeInfo)
  };
  
  main().catch(console.error);
  