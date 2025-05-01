import { getVideoUrlFromEmbed } from "../../index.js"; // REPLACE BY "from 'better-ani-scraped';"

const main = async () => {
  const embedUrl = "https://video.sibnet.ru/shell.php?videoid=4291083";
  
  const videoUrl = await getVideoUrlFromEmbed("sibnet", embedUrl)
  console.log("Video URL:", videoUrl);

};

main().catch(console.error);
