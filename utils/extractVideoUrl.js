import axios from "axios";
import * as cheerio from "cheerio";

export async function getSibnetVideo(embedUrl) {
  let intermediaries = [];
  let realUrl = "";

  const getIntermediary = async () => {
    try {
      const { data } = await axios.get(embedUrl, { headers: getHeaders(embedUrl) });
      const $ = cheerio.load(data);
      const script = $("script")
        .toArray()
        .map((s) => $(s).html())
        .find((s) => s.includes("player.src"));
      const match = script?.match(/player\.src\(\[{src:\s*["']([^"']+)["']/);
      if (match) intermediaries.push(`https://video.sibnet.ru${match[1]}`);
      return !!match;
    } catch {
      return false;
    }
  };

  const followRedirection = async () => {
    if (!intermediaries.length) return false;
    try {
      const first = await axios.get(intermediaries[0], {
        headers: getHeaders(embedUrl),
        maxRedirects: 0,
        validateStatus: (s) => s >= 200 && s < 303,
      });

      const redirect1 = correct(first.headers.location);
      intermediaries.push(redirect1);

      const second = await axios.get(redirect1, {
        headers: getHeaders(intermediaries[0]),
        maxRedirects: 0,
        validateStatus: (s) => s >= 200 && s < 303,
      });

      realUrl =
        second.status === 302
          ? correct(second.headers.location)
          : second.status === 200
          ? intermediaries.pop()
          : "";
      return !!realUrl;
    } catch {
      return false;
    }
  };

  const correct = (url) => (url.startsWith("https:") ? url : `https:${url}`);

  const getHeaders = (referer) => ({
    Accept: "*/*",
    Referer: referer,
    Range: "bytes=0-",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });

  return (await getIntermediary()) && (await followRedirection())
    ? realUrl
    : null;
}
