import { getAllAnime } from "../index.js"; // REPLACE BY "from 'ani-scraped';"

const main = async () => {
  await getAllAnime("animesama", "output_anime_list.json", false);
};

main().catch(console.error);
