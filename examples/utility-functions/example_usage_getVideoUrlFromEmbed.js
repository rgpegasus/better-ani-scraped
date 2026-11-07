import { getVideoUrlFromEmbed } from "../../index.js"; // REPLACE BY "from 'better-ani-scraped';"

const main = async () => {
  const embedUrlSibnet = "https://video.sibnet.ru/shell.php?videoid=4291083";
  const embedUrlSendvid = "https://sendvid.com/embed/4vzpcb0q";
  const embedUrlVidmoly = "https://ansembed.net/embed-aqdvp8fvctkb.html";
  const embedUrlSmoothpre = "https://smoothpre.com/embed/8294jcf1q8jf";
  const embedUrlEmbed4me = "https://lpayer.embed4me.com/#3jetu";
  const embedUrlAnsembed = "https://ansembed.net/embed-aqdvp8fvctkb.html";
  const embedUrlUqload = "https://uqload.vc/embed-8gsnx26lcsax.html";

  // const videoUrlSibnet = await getVideoUrlFromEmbed("sibnet", embedUrlSibnet)
  // console.log("Video URL Sibnet:", videoUrlSibnet);

  const videoUrlSendvid = await getVideoUrlFromEmbed("sendvid", embedUrlSendvid)
  console.log("Video URL Sendvid:", videoUrlSendvid);

  // const videoUrlVidmoly = await getVideoUrlFromEmbed("vidmoly", embedUrlVidmoly)
  // console.log("Video URL Vidmoly:", videoUrlVidmoly);

  const videoUrlSmoothpre = await getVideoUrlFromEmbed("smoothpre", embedUrlSmoothpre)
  console.log("Video URL Smoothpre:", videoUrlSmoothpre);
  
  // const videoUrlEmbed4me = await getVideoUrlFromEmbed("embed4me", embedUrlEmbed4me)
  // console.log("Video URL Embed4me:", videoUrlEmbed4me);

  const videoUrlAnsembed = await getVideoUrlFromEmbed("ansembed", embedUrlAnsembed)
  console.log("Video URL Ansembed:", videoUrlAnsembed);

  const videoUrlUqload = await getVideoUrlFromEmbed("uqload", embedUrlUqload)
  console.log("Video URL Uqload:", videoUrlUqload);

};

main().catch(console.error);
