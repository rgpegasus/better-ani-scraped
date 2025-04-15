import { AnimeScraper, getVideoUrlFromEmbed } from "../index.js"; // REPLACE BY "from 'better-ani-scraped';"

const main = async () => {
  const scraper = new AnimeScraper('animesama');

  const search = await scraper.searchAnime("frieren");
  console.log("Search Results:", search);

  const animeUrl = Object.values(search)[0].url;
  const seasons = await scraper.getSeasons(animeUrl, "vostfr");
  console.log("Seasons:", seasons);

  const embeds = await scraper.getEmbed(seasons[0].url, [
    "sibnet",
    "vidmoly",
  ]);
  console.log("Embed Links:", embeds);

  const videoUrl = await getVideoUrlFromEmbed("sibnet", embeds[11])
  console.log("Video URL:", videoUrl);
};

main().catch(console.error);
