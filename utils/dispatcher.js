import * as extractor from "./extractVideoUrl.js";

export async function getVideoUrlFromEmbed(source, embedUrl) {
  if (source === "sibnet") {
    return await extractor.getSibnetVideo(embedUrl);
  }
  if (source === "sendvid") {
    return await extractor.getSendvidVideo(embedUrl);
  }
  if (source === "vidmoly" || source === "oneupload" ) { 
    return await extractor.getVidmolyOrOneuploadVideo(embedUrl);
  }

  throw new Error(`Unsupported embed source: ${source}`);
}
