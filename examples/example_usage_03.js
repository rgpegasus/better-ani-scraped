// FUTURE COMMAND (NOT IMPLEMENTED YET)
import { listAllAnime } from "../index.js"; // REPLACE BY import { searchAnime, getSeasons, getEmbed } from 'ani-scraped';

const main = async () => {
  await listAllAnime("animesama", "animeList.json");
};

main().catch(console.error);
