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
      if (skipStart) {
        intro[0] = Number(skipStart);
      }
      if (skipTime) {
        intro[1] = Number(skipTime);
      }
    }
    if (match && match[1]) {
      return {
        videoUrl: match[1],
        openingTime: intro,
      };
    }
    return null;
  } catch (err) {
    console.error("Erreur getVidmolyVideo:", err.message);
    return null;
  }
}

export async function getSmoothpreVideo(embedUrl) {
  const html = await (
    await fetch(embedUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
    })
  ).text();

  const packed = html.match(
    /eval\(function\(p,a,c,k,e,d\)([\s\S]+?)\)\s*<\/script>/,
  )?.[0];
  if (!packed) return null;

  const m = packed.match(
    /}\s*\(\s*'([\s\S]*)'\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*'([\s\S]*)'\s*\.split\(/,
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

import crypto from "crypto";
import { cp } from "fs";

const DECRYPT_KEY = Buffer.from("6b69656d7469656e6d75613931316361", "hex"); // kiemtienmua911ca
const DECRYPT_IV = Buffer.from("313233343536373839306f6975797472", "hex"); // 1234567890oiuytr


function decryptApiResponse(hexData) {
  const decipher = crypto.createDecipheriv(
    "aes-128-cbc",
    DECRYPT_KEY,
    DECRYPT_IV,
  );
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(hexData, "hex")),
    decipher.final(),
  ]);
  return JSON.parse(decrypted.toString("utf8"));
}

export async function getEmbed4meVideo(embedUrl) {
  try {
    const videoId = new URL(embedUrl).hash.replace("#", "");
    if (!videoId) return null;

    const { data } = await axios.get(
      `https://lpayer.embed4me.com/api/v1/video?id=${videoId}&w=1920&h=1080&r=`,
      { headers: getHeaders(embedUrl) },
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