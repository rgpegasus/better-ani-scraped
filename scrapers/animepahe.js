import puppeteer from "puppeteer";

const BASE_URL = "https://animepahe.ru";

export async function searchAnime(query) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Go to any page, we need to load a page to enable network interception
  await page.goto(BASE_URL);

  // Intercept the API request using Puppeteer
  const searchResults = await page.evaluate(async (query) => {
    const response = await fetch(`https://animepahe.ru/api?m=search&q=${query}`);
    const data = await response.json();

    // Map over the data, rename 'poster' to 'cover', and remove 'poster' field
    return data.data.map(anime => {
      const { poster, ...rest } = anime;  // Destructure 'poster' and keep the rest of the properties
      return {
        ...rest,
        cover: poster,  // Add 'cover'
        url: `https://animepahe.ru/anime/${anime.session}`
      };
    });
  }, query);

  await browser.close();

  return searchResults;
}
