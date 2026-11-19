import * as extractor from "./extractVideoUrl.js";
export * as utilityFunctions from "./functions.js";

const EXTRACTORS = {
  sendvid: extractor.getSendvidVideo,
  smoothpre: extractor.getEarnVideo,
  callistanise: extractor.getEarnVideo,
  minochinos: extractor.getEarnVideo,
  ansembed: extractor.getAnsembedVideo,
  uqload: extractor.getUqloadVideo,
  susanexpectcare : extractor.getVoeVideo,
  // sibnet: extractor.getSibnetVideo,
  // vidmoly: extractor.getVidmolyVideo,
  // embed4me: extractor.getEmbed4meVideo,
};

export async function getVideoUrlFromEmbed(source, embedUrl) {
  const fn = EXTRACTORS[source];
  if (!fn) {
    throw new Error(`Unsupported embed source: ${source}`);
  }
  return fn(embedUrl);
}