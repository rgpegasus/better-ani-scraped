// FUTURE COMMAND (NOT IMPLEMENTED YET)
import { getAllAnime } from "../index.js"; // REPLACE BY import { searchAnime, getSeasons, getEmbed } from 'ani-scraped';

const main = async () => {
  await getAllAnime("animesama", "output_anime_list.json");
};

main().catch(console.error);
