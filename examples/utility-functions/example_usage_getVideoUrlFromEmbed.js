import { getVideoUrlFromEmbed } from "../../index.js"; // REPLACE BY "from 'better-ani-scraped';"

const main = async () => {
  const embedUrlSibnet = "https://video.sibnet.ru/shell.php?videoid=4291083";
  const embedUrlSendvid = "https://sendvid.com/embed/4vzpcb0q";
  const embedUrlVidmoly = "https://vidmoly.to/embed-vt374ef2joph.html";
  const embedUrlOneupload = "https://oneupload.net/embed-axdrxh1y3p37.html";

  const videoUrlSibnet = await getVideoUrlFromEmbed("sibnet", embedUrlSibnet)
  console.log("Video URL Sibnet:", videoUrlSibnet);

  const videoUrlSendvid = await getVideoUrlFromEmbed("sendvid", embedUrlSendvid)
  console.log("Video URL Sendvid:", videoUrlSendvid);

  const videoUrlVidmoly = await getVideoUrlFromEmbed("vidmoly", embedUrlVidmoly)
  console.log("Video URL Vidmoly:", videoUrlVidmoly);
  
  const videoUrlOneupload = await getVideoUrlFromEmbed("oneupload", embedUrlOneupload)
  console.log("Video URL Oneupload:", videoUrlOneupload);
};

main().catch(console.error);
