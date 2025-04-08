import { searchAnime, getSeasons, getEmbed } from '../index.js';

const main = async () => {
  const search = await searchAnime('animesama', 'sword art online', 3);
  console.log('🔍 Search Results:', search);

  const animeUrl = Object.values(search)[0];
  const seasons = await getSeasons('animesama', animeUrl);
  console.log('📺 Seasons:', seasons);

  const embeds = await getEmbed('animesama', seasons[0].url, ['sibnet', 'vidmoly']);
  console.log('🎬 Embed Links:', embeds);
};

main().catch(console.error);
