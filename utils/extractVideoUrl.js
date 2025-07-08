import axios from "axios";
import * as cheerio from "cheerio";


const getHeaders = (referer) => ({
  Accept: "*/*",
  Referer: referer,
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
});
export async function getSibnetVideo(embedUrl) {
  try {
    const { data } = await axios.get(embedUrl, {
      headers: getHeaders(embedUrl),
    });
    const $ = cheerio.load(data);
    const script = $("script")
      .toArray()
      .map((s) => $(s).html())
      .find((s) => s.includes("player.src"));
    const match = script?.match(/player\.src\(\[{src:\s*["']([^"']+)["']/);
    if (!match || !match[1]) return null;
    const intermediateUrl = `https://video.sibnet.ru${match[1]}`;
    const res1 = await axios.get(intermediateUrl, {
      headers: getHeaders(embedUrl),
      maxRedirects: 0,
      validateStatus: (s) => s >= 200 && s < 400, 
    });
    const redirectUrl = res1.headers.location;
    if (!redirectUrl) return null;
    const finalUrl = redirectUrl.startsWith("http")
      ? redirectUrl
      : `https:${redirectUrl}`;
    return finalUrl;
  } catch (err) {
    console.error("Erreur getSibnetVideo:", err.message);
    return null;
  }
}

export async function getSendvidVideo(embedUrl) {
  try {
    const { data } = await axios.get(embedUrl, {
      headers: getHeaders(embedUrl),
    });
    const $ = cheerio.load(data);
    const sourceTag = $("video source[type='video/mp4']").attr("src");
    return sourceTag || null;
  } catch (err) {
    return null;
  }
}

export async function getVidmolyOrOneuploadVideo(embedUrl) {
  try {
    console.log(embedUrl)
    const { data } = await axios.get(embedUrl, {
      headers: getHeaders(embedUrl),
    });
    console.log(data)
    const $ = cheerio.load(data);
    const scripts = $("script");

    for (let i = 0; i < scripts.length; i++) {
      const content = $(scripts[i]).html();
      const match = content && content.match(/file\s*:\s*"(https[^"]+\.m3u8[^"]*)"/);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  } catch (err) {
    console.error("Erreur getVidmolyVideo:", err.message);
    return null;
  }
}
