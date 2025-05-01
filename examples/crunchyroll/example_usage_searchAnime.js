import { AnimeScraper } from "../../index.js"; // REPLACE BY "from 'better-ani-scraped';"

const main = async () => {
    const crunchyroll = new AnimeScraper('crunchyroll');
    
    const search = await crunchyroll.searchAnime("86", 3);
    console.log("Search Results:", search);
  };
  
  main().catch(console.error);
  