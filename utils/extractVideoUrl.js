import axios from "axios";
import * as cheerio from "cheerio";
import CryptoJS from "crypto-js";
import { AnimeScraper } from "../index.js";
const getHeaders = (referer = "") => ({
  Accept: "*/*",
  Referer: referer,
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
});

// Clés d'initialisation en format Hex pour CryptoJS
const DECRYPT_KEY = CryptoJS.enc.Hex.parse("6b69656d7469656e6d75613931316361");
const DECRYPT_IV = CryptoJS.enc.Hex.parse("313233343536373839306f6975797472");

// Fonction de déchiffrement universelle (sans module Node 'crypto' ni Buffer natif)
function decryptApiResponse(hexData) {
  const cipherText = CryptoJS.enc.Hex.parse(hexData);
  const decrypted = CryptoJS.AES.decrypt(
    { ciphertext: cipherText },
    DECRYPT_KEY,
    {
      iv: DECRYPT_IV,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }
  );
  const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
  return JSON.parse(jsonString);
}

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

export async function getVidmolyVideo(embedUrl) {
  try {
    if (embedUrl.includes("vidmoly.to/")) {
      embedUrl = embedUrl.replace("vidmoly.to/", "vidmoly.biz/");
    }
    const { data } = await axios.get(embedUrl, {
      headers: getHeaders(embedUrl),
    });
    const $ = cheerio.load(data);
    const scripts = $("script");
    let match = "";
    let intro = [0, 0];
    for (let i = 0; i < scripts.length; i++) {
      const content = $(scripts[i]).html();
      if (!match) {
        match = content?.match(/file\s*:\s*['"](https[^'"]+\.m3u8[^'"]*)['"]/);
      }
      const skipStart = content.match(/var\s*skipStart\s*=\s*([^;]+)/)?.[1];
      const skipTime = content.match(/var\s*skipTime\s*=\s*([^;]+)/)?.[1];
      if (skipStart) intro[0] = Number(skipStart);
      if (skipTime) intro[1] = Number(skipTime);
    }
    if (match && match[1]) {
      return { videoUrl: match[1], openingTime: intro };
    }
    return null;
  } catch (err) {
    console.error("Erreur getVidmolyVideo:", err.message);
    return null;
  }
}

export async function getEarnVideo(embedUrl) {
  const animesama = new AnimeScraper('animesama');
  const BASE_URL = await animesama.getWorkingUrl();
  const html = await ( await fetch(embedUrl, { headers: getHeaders(BASE_URL) })).text();

  const packed = html.match(
    /eval\(function\(p,a,c,k,e,d\)([\s\S]+?)\)\s*<\/script>/
  )?.[0];
  if (!packed) return null;

  const m = packed.match(
    /}\s*\(\s*'([\s\S]*)'\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*'([\s\S]*)'\s*\.split\(/
  );
  if (!m) return null;

  const k = m[4].split("|"),
    a = parseInt(m[2]);
  const decoded = m[1].replace(/\b\w+\b/g, (w) => k[parseInt(w, a)] || w);

  const hls4 = decoded.match(/"hls4"\s*:\s*"([^"]+)"/)?.[1];
  const hls2 = decoded.match(/"hls2"\s*:\s*"([^"]+)"/)?.[1];

  if (hls4)
    return hls4.startsWith("http") ? hls4 : new URL(embedUrl).origin + hls4;
  return hls2 || null;
}

export async function getEmbed4meVideo(embedUrl) {
  try {
    const videoId = new URL(embedUrl).hash.replace("#", "");
    if (!videoId) return null;

    const { data } = await axios.get(
      `https://lpayer.embed4me.com/api/v1/video?id=${videoId}&w=1920&h=1080&r=`,
      { headers: getHeaders(embedUrl) }
    );

    const json = decryptApiResponse(data);
    return (
      (json.hlsVideoTiktok
        ? `https://lpayer.embed4me.com${json.hlsVideoTiktok}?v=${json.version}`
        : null) ||
      json.cf ||
      json.source ||
      null
    );
  } catch (err) {
    console.error("Erreur getEmbed4meVideo:", err.message);
    return null;
  }
}

export async function getAnsembedVideo(embedUrl) {
  try {
    const { data } = await axios.get(embedUrl, {
      headers: getHeaders(embedUrl),
    });
    const $ = cheerio.load(data);
    const scripts = $("script");
    let match = "";
    for (let i = 0; i < scripts.length; i++) {
      const content = $(scripts[i]).html();
      if (!match) {
        match = content?.match(/file\s*:\s*['"](https[^'"]+\.m3u8[^'"]*)['"]/);
      }
    }
    if (match && match[1]) {
      return match[1];
    }
    return null;
  } catch (err) {
    console.error("Erreur getAnsembedVideo:", err.message);
    return null;
  }
}

export async function getUqloadVideo(embedUrl) {
  try {
    const { data } = await axios.get(embedUrl, { headers: getHeaders() });

    if (!data.includes("eval(function")) return null;

    const matchData = data.match(
      /}\('([\s\S]+?)',\s*(\d+),\s*(\d+),\s*'([\s\S]+?)'\.split\(['"]\|['"]\)/
    );
    if (!matchData) return null;

    let p = matchData[1].replace(/\\'/g, "'").replace(/\\\\/g, "\\");
    const a = parseInt(matchData[2], 10);
    let c = parseInt(matchData[3], 10);
    const k = matchData[4].split("|");

    while (c--) {
      if (k[c]) {
        p = p.replace(new RegExp("\\b" + c.toString(a) + "\\b", "g"), k[c]);
      }
    }

    const m3u8Match =
      p.match(/https?:\/\/[^\s"'+\\]+?master\.m3u8\?[^\s"'+\\]+/i) ||
      p.match(/https?:\/\/[^\s"'+\\]+\.m3u8[^\s"'+\\]*/i) ||
      p.match(/https?:\/\/[^\s"'+\\]+\.urlset[^\s"'+\\]*/i);

    if (m3u8Match) return m3u8Match[0];
    return null;
  } catch (err) {
    console.error("Erreur getUqloadVideo:", err.message);
    return null;
  }
}

export async function getVoeVideo(embedUrl) {
  const { data } = await axios.get(embedUrl, { headers: getHeaders() });
  const $ = cheerio.load(data);

  const payload = $('script[type="application/json"]')
    .toArray()
    .map((el) => { try { return JSON.parse($(el).html()); } catch { return null; } })
    .find((v) => Array.isArray(v) && typeof v[0] === "string")?.[0];
  if (!payload) throw new Error("getVoeVideo : payload introuvable");
  const rot13 = payload.replace(/[a-z]/gi, (c) => {
    const base = c <= "Z" ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
  });
  const shifted = [...atob(rot13.replace(/@\$|\^\^|~@|%\?|\*~|!!|#&|_/g, ""))]
    .map((c) => String.fromCharCode(c.charCodeAt(0) - 3))
    .reverse()
    .join("");

  const videoUrl = atob(shifted).replaceAll("\\/", "/").match(/https?:\/\/[^"\s]+?\.m3u8[^"\s]*/i)?.[0];
  if (!videoUrl) throw new Error("getVoeVideo : URL m3u8 introuvable");
  return videoUrl;
}
