import * as animesama from "./animesama.js";

export class AnimeScraper {
  constructor(source) {
    if (source !== "animesama") {
      throw new Error('Invalid source. Choose either "animesama".');
    }

    this.source = animesama;
  }


  async getWorkingUrl(listUrl) {
    try {
      return await this.source.getWorkingUrl(listUrl);
    } catch (error) {
      console.error(`[getWorkingUrl] ${error.message}`);
      return "";
    }
  }

  async searchAnime(query, ...rest) {
    try {
      return await this.source.searchAnime(query, ...rest);
    } catch (error) {
      console.error(`[searchAnime] ${error.message}`);
      return [];
    }
  }

  async getSeasons(animeUrl, ...rest) {
    try {
      return await this.source.getSeasons(animeUrl, ...rest);
    } catch (error) {
      console.error(`[getSeasons] ${error.message}`);
      return [];
    }
  }

  async getEpisodeTitles(seasonUrl, ...rest) {
    try {
      return await this.source.getEpisodeTitles(seasonUrl, ...rest);
    } catch (error) {
      console.error(`[getEpisodeTitles] ${error.message}`);
      return [];
    }
  }

  async resolveLienUrl(url, ...rest) {
    try {
      return await this.source.resolveLienUrl(
        url,
        ...rest,
      );
    } catch (error) {
      console.error(`[resolveLienUrl] ${error.message}`);
      return "";
    }
  }

  async getEmbed(seasonUrl, hostPriority, allHost, includeInfo, ...rest) {
    try {
      return await this.source.getEmbed(
        seasonUrl,
        hostPriority,
        allHost,
        includeInfo,
        ...rest,
      );
    } catch (error) {
      console.error(`[getEmbed] ${error.message}`);
      return includeInfo ? {} : [];
    }
  }

  async getAnimeInfo(animeUrl) {
    try {
      return await this.source.getAnimeInfo(animeUrl);
    } catch (error) {
      console.error(`[getAnimeInfo] ${error.message}`);
      return {};
    }
  }

  async getAvailableLanguages(seasonUrl, ...rest) {
    try {
      return await this.source.getAvailableLanguages(seasonUrl, ...rest);
    } catch (error) {
      console.error(`[getAvailableLanguages] ${error.message}`);
      return [];
    }
  }

  async getAllAnime(...rest) {
    try {
      return await this.source.getAllAnime(...rest);
    } catch (error) {
      console.error(`[getAllAnime] ${error.message}`);
      return [];
    }
  }

  async getLatestEpisodes(...rest) {
    try {
      return await this.source.getLatestEpisodes(...rest);
    } catch (error) {
      console.error(`[getLatestEpisodes] ${error.message}`);
      return [];
    }
  }

  async getLatestScans(...rest) {
    try {
      return await this.source.getLatestScans(...rest);
    } catch (error) {
      console.error(`[getLatestScans] ${error.message}`);
      return [];
    }
  }

  async getRandomAnime(...rest) {
    try {
      return await this.source.getRandomAnime(...rest);
    } catch (error) {
      console.error(`[getRandomAnime] ${error.message}`);
      return null;
    }
  }

  async getChapterTitles(
    mangaUrl,
    includeNumberImg,
    includeEncodedTitle,
    ...rest
  ) {
    try {
      return await this.source.getChapterTitles(
        mangaUrl,
        includeNumberImg,
        includeEncodedTitle,
        ...rest,
      );
    } catch (error) {
      console.error(`[getChapterTitles] ${error.message}`);
      return includeEncodedTitle ? { scans: [], encodedTitle: "" } : [];
    }
  }

  async getImgScans(mangaUrl, ...rest) {
    try {
      return await this.source.getImgScans(mangaUrl, ...rest);
    } catch (error) {
      console.error(`[getImgScans] ${error.message}`);
      return [];
    }
  }
}
