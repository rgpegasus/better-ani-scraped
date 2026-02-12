import puppeteer from "puppeteer";

const BASE_URL = "https://animepahe.si";

export async function searchAnime(query) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(BASE_URL);

  const searchResults = await page.evaluate(async ({query, BASE_URL}) => {
    console.log(`${BASE_URL}`);
    const response = await fetch(`${BASE_URL}/api?m=search&q=${query}`);
    const data = await response.json();

    return data.data.map(anime => {
      const { poster, ...rest } = anime;
      return {
        ...rest,
        cover: poster,
        url: `${BASE_URL}/anime/${anime.session}`
      };
    });
  }, {query, BASE_URL});

  await browser.close();

  return searchResults;
}
