import { getAnimeInfo, getAvailableLanguages } from "../index.js"; // REPLACE BY "from 'ani-scraped';"

const main = async () => {
  const animeUrl = "https://anime-sama.fr/catalogue/sword-art-online";
  const animeInfo = await getAnimeInfo("animesama", animeUrl);
  console.log(animeInfo);
  
  const animeLanguages = await getAvailableLanguages("animesama", animeUrl);
  console.log(animeLanguages);
};

main().catch(console.error);
