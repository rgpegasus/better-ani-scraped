import { getVideoUrlFromEmbed } from "../../index.js"; // REPLACE BY "from 'better-ani-scraped';"

const main = async () => {
  const embedUrlSibnet = "https://video.sibnet.ru/shell.php?videoid=4291083";
  const embedUrlSendvid = "https://sendvid.com/embed/4vzpcb0q";
  const embedUrlVidmoly = "https://vidmoly.biz/embed-rvqrwg5zk37w.html";
  const embedUrlOneupload = "https://oneupload.net/embed-axdrxh1y3p37.html";
  const embedUrlSmoothpre = "https://smoothpre.com/embed/8294jcf1q8jf";
  const embedUrlMovearnpre = "https://movearnpre.com/embed/e3xbkin87yt3";

  const videoUrlSibnet = await getVideoUrlFromEmbed("sibnet", embedUrlSibnet)
  console.log("Video URL Sibnet:", videoUrlSibnet);

  const videoUrlSendvid = await getVideoUrlFromEmbed("sendvid", embedUrlSendvid)
  console.log("Video URL Sendvid:", videoUrlSendvid);

  const videoUrlVidmoly = await getVideoUrlFromEmbed("vidmoly", embedUrlVidmoly)
  console.log("Video URL Vidmoly:", videoUrlVidmoly);
  
  const videoUrlOneupload = await getVideoUrlFromEmbed("oneupload", embedUrlOneupload)
  console.log("Video URL Oneupload:", videoUrlOneupload);

  const videoUrlSmoothpre = await getVideoUrlFromEmbed("smoothpre", embedUrlSmoothpre)
  console.log("Video URL Smoothpre:", videoUrlSmoothpre);

  const videoUrlMovearnpre = await getVideoUrlFromEmbed("movearnpre", embedUrlMovearnpre)
  console.log("Video URL Movearnpre:", videoUrlMovearnpre);

};

main().catch(console.error);
