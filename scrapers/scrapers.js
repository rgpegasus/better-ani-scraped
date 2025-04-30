import * as animesama from "./animesama.js";
import * as animepahe from "./animepahe.js";
import * as crunchyroll from "./crunchyroll.js";

export class AnimeScraper {
  constructor(source) {
    if (source === 'animepahe') {
      this.source = animepahe;
    } else if (source === 'animesama') {
      this.source = animesama;
    } else if (source === 'crunchyroll') {
      this.source = crunchyroll;
    }  else {
      throw new Error('Invalid source. Choose either "animepahe", "crunchyroll" or "animesama".');
    }
  }

  async searchAnime(query, ...rest) {
    try {
      return await this.source.searchAnime(query, ...rest);
    } catch (error) {
      console.error(`This scraper does not have the searchAnime function implemented or an error happened -> ${error}`);
      return null;
    }
  }

  async getSeasons(animeUrl, ...rest) {
    try {
      return await this.source.getSeasons(animeUrl, ...rest);
    } catch (error) {
      console.error(`This scraper does not have the getSeasons function implemented or an error happened -> ${error}`);
      return null;
    }
  }

  async getEmbed(animeUrl, ...rest) {
    try {
      return await this.source.getEmbed(animeUrl, ...rest);
    } catch (error) {
      console.error(`This scraper does not have the getEmbed function implemented or an error happened -> ${error}`);
      return null;
    }
  }

  async getAnimeInfo(animeUrl) {
    try {
      return await this.source.getAnimeInfo(animeUrl);
    } catch (error) {
      console.error(`This scraper does not have the getAnimeInfo function implemented or an error happened -> ${error}`);
      return null;
    }
  }

  async getAvailableLanguages(animeUrl, ...rest) {
    try {
      return await this.source.getAvailableLanguages(animeUrl, ...rest);
    } catch (error) {
      console.error(`This scraper does not have the getAvailableLanguages function implemented or an error happened -> ${error}`);
      return null;
    }
  }

  async getAllAnime(...rest) {
    try {
      return await this.source.getAllAnime(...rest);
    } catch (error) {
      console.error(`This scraper does not have the getAllAnime function implemented or an error happened -> ${error}`);
      return null;
    }
  }

  async getLatestEpisodes(...rest) {
    try {
      return await this.source.getLatestEpisodes(...rest);
    } catch (error) {
      console.error(`This scraper does not have the getLatestEpisodes function implemented or an error happened -> ${error}`);
      return null;
    }
  }

  async getRandomAnime() {
    try {
      return await this.source.getRandomAnime();
    } catch (error) {
      console.error(`This scraper does not have the getRandomAnime function implemented or an error happened -> ${error}`);
      return null;
    }
  }

  async getEpisodeTitles(animeUrl, ...rest) {
    try {
      return await this.source.getEpisodeTitles(animeUrl, ...rest);
    } catch (error) {
      console.error(`This scraper does not have the getEpisodeTitles function implemented or an error happened -> ${error}`);
      return null;
    }
  }
  async getEpisodeInfo(animeUrl, ...rest) {
    try {
      return await this.source.getEpisodeInfo(animeUrl, ...rest);
    } catch (error) {
      console.error(`This scraper does not have the getEpisodeInfo function implemented or an error happened -> ${error}`);
      return null;
    }
  }
}