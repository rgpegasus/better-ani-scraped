import * as extractor from "./extractVideoUrl.js";

export async function getVideoUrlFromEmbed(source, embedUrl) {
  if (source === "sibnet") {
    return await extractor.getSibnetVideo(embedUrl);
  }
  if (source === "sendvid") {
    return await extractor.getSendvidVideo(embedUrl);
  }
  if (source === "vidmoly") { 
    return await extractor.getVidmolyVideo(embedUrl);
  }
  if (source === "smoothpre" ) { 
    return await extractor.getSmoothpreVideo(embedUrl);
  }
  if (source === "embed4me") {
    return await extractor.getEmbed4meVideo(embedUrl);
  }

  throw new Error(`Unsupported embed source: ${source}`);
}
