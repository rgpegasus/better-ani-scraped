import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
puppeteer.use(StealthPlugin());

const LANGUAGE = "fr";
const CATALOGUE_URL = `https://www.crunchyroll.com/${LANGUAGE}`;

export async function searchAnime(query, limit = 10) {
    const url = `${CATALOGUE_URL}/search?q=${encodeURIComponent(query)}`;
    const browser = await puppeteer.launch({ headless: true }); 
    const page = await browser.newPage();
    
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.series-results-cards-wrapper [data-t="search-series-card"]');
    const results = await page.evaluate((limit) => {
      const cards = document.querySelectorAll('.series-results-cards-wrapper [data-t="search-series-card"]');
      const results = [];
      
      cards.forEach(card => {
        if (results.length < limit) {
          const title = card.querySelector('.search-show-card__title-link--7ilnY')?.innerText;
          const url = card.querySelector('.search-show-card__title-link--7ilnY')?.href;
          const cover = card.querySelector('.content-image__image--7tGlg').src?.replace(/cdn-cgi\/image\/[^\/]+(\/catalog\/.*)/, 'cdn-cgi/image/$1') || null;
          
          if (title && url && !results.some(result => result.url === url)) {
            results.push({ title, url, cover });
          }
        }
      });
      return results;
    }, limit);
  
    await browser.close();
    return results;
  }
  


export async function getEpisodeInfo(animeUrl, seasonTitle) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(animeUrl, { waitUntil: 'domcontentloaded' });
    try {
        await page.waitForSelector('.erc-seasons-select .dropdown-trigger--P--FX', { timeout: 5000 });
        await page.click('.erc-seasons-select .dropdown-trigger--P--FX');
        await page.evaluate((seasonTitle) => {
          const options = Array.from(document.querySelectorAll('.extended-option--Wk-jL'));
          const target = options.find(opt => {
            const label = opt.querySelector('.extended-option__text--MQWp1');
            return label && label.textContent.includes(seasonTitle);
          });
          if (target) {
            target.click();
          } else {
            console.warn('Saison non trouvée:', seasonTitle);
          }
        }, seasonTitle);
    } catch {   }
    
    
    try {
      await page.waitForSelector('.show-more-button-boxed button', { timeout: 1000 }); 
      await page.click('.show-more-button-boxed button');
    } catch {   }
  
    await page.waitForSelector('div.card:not(.placeholder-card)', { timeout: 10000 });
    const allCardInfo = await page.evaluate(() => {
      const cards = document.querySelectorAll('div.card:not(.placeholder-card)');
      const episodeInfo = [];
  
      cards.forEach(card => {
        const title = card?.querySelector('.playable-card__title-link--96psl')?.textContent || null;
        const synopsis = card?.querySelector('.playable-card-hover__description--4Lpe4')?.textContent || null;
        const releaseDate = card?.querySelector('.playable-card-hover__release--3Xg35 .text--gq6o-')?.textContent || null;
        const cover = card?.querySelector('img.progressive-image-loading__original--k-k-7')?.src?.replace(/cdn-cgi\/image\/[^\/]+(\/catalog\/.*)/, 'cdn-cgi/image/$1') || null;
        episodeInfo.push({
          title,
          synopsis,
          releaseDate,
          cover,
        });
      });
  
      return episodeInfo;
    });
    await browser.close();
    return allCardInfo; 
  }
  