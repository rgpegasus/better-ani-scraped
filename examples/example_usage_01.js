import { searchAnime, getSeasons, getEmbed, getVideoUrlFromEmbed } from "../index.js"; // REPLACE BY "from 'ani-scraped';"

const main = async () => {
  const search = await searchAnime("animesama", "demon slayer", 3);
  console.log("Search Results:", search);

  const animeUrl = Object.values(search)[0].url;
  const seasons = await getSeasons("animesama", animeUrl, "vostfr");
  console.log("Seasons:", seasons);

  const embeds = await getEmbed("animesama", seasons[0].url, [
    "sibnet",
    "vidmoly",
  ]);
  console.log("Embed Links:", embeds);

  const videoUrl = await getVideoUrlFromEmbed("sibnet", embeds[0])
  console.log("Video URL:", videoUrl);
};

main().catch(console.error);
