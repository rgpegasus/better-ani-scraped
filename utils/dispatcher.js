import * as extractor from "./extractVideoUrl.js";

export async function getVideoUrlFromEmbed(source, embedUrl) {
  if (source === "sibnet") {
    return await extractor.getSibnetVideo(embedUrl);
  }

  throw new Error(`Unsupported embed source: ${source}`);
}
