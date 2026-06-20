import * as animesama from "./animesama.js";

export class AnimeScraper {
  constructor(source) {
    if (source === "animesama") {
      this.source = animesama;
    } else {
      throw new Error(
        'Invalid source. Choose either "animesama".',
      );
    }
  }
  async getWorkingUrl(listUrl) {
    try {
      return await this.source.getWorkingUrl(listUrl);
    } catch (error) {
      console.error(
        `This scraper does not have the getWorkingUrl function implemented or an error happened -> ${error}`,
      );
      return "";
    }
  }
  async searchAnime(query, ...rest) {
    try {
      return await this.source.searchAnime(query, ...rest);
    } catch (error) {
      console.error(
        `This scraper does not have the searchAnime function implemented or an error happened -> ${error}`,
      );
      return [];
    }
  }

  async getSeasons(animeUrl, ...rest) {
    try {
      return await this.source.getSeasons(animeUrl, ...rest);
    } catch (error) {
      console.error(
        `This scraper does not have the getSeasons function implemented or an error happened -> ${error}`,
      );
      return [];
    }
  }

  async getEpisodeTitles(seasonUrl, ...rest) {
    try {
      return await this.source.getEpisodeTitles(seasonUrl, ...rest);
    } catch (error) {
      console.error(
        `This scraper does not have the getEpisodeTitles function implemented or an error happened -> ${error}`,
      );
      return [];
    }
  }

  async getTitles(seasonUrl, ...rest) {
    try {
      return await this.source.getTitles(seasonUrl, ...rest);
    } catch (error) {
      console.error(
        `This scraper does not have the getTitles function implemented or an error happened -> ${error}`,
      );
      return [];
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
      console.error(
        `This scraper does not have the getEmbed function implemented or an error happened -> ${error}`,
      );
      if (includeInfo === true) {
        return {};
      } else {
        return [];
      }
    }
  }

  async getAnimeInfo(animeUrl) {
    try {
      return await this.source.getAnimeInfo(animeUrl);
    } catch (error) {
      console.error(
        `This scraper does not have the getAnimeInfo function implemented or an error happened -> ${error}`,
      );
      return {};
    }
  }

  async getAvailableLanguages(animeUrl, ...rest) {
    try {
      return await this.source.getAvailableLanguages(animeUrl, ...rest);
    } catch (error) {
      console.error(
        `This scraper does not have the getAvailableLanguages function implemented or an error happened -> ${error}`,
      );
      return [];
    }
  }

  async getAllAnime(...rest) {
    try {
      return await this.source.getAllAnime(...rest);
    } catch (error) {
      console.error(
        `This scraper does not have the getAllAnime function implemented or an error happened -> ${error}`,
      );
      return [];
    }
  }

  async getLatestEpisodes(...rest) {
    try {
      return await this.source.getLatestEpisodes(...rest);
    } catch (error) {
      console.error(
        `This scraper does not have the getLatestEpisodes function implemented or an error happened -> ${error}`,
      );
      return [];
    }
  }

  async getLatestScans(...rest) {
    try {
      return await this.source.getLatestScans(...rest);
    } catch (error) {
      console.error(
        `This scraper does not have the getLatestScans function implemented or an error happened -> ${error}`,
      );
      return [];
    }
  }
  async getRandomAnime(...rest) {
    try {
      return await this.source.getRandomAnime(...rest);
    } catch (error) {
      console.error(
        `This scraper does not have the getRandomAnime function implemented or an error happened -> ${error}`,
      );
      return [];
    }
  }

  async getEpisodeInfo(animeUrl, ...rest) {
    try {
      return await this.source.getEpisodeInfo(animeUrl, ...rest);
    } catch (error) {
      console.error(
        `This scraper does not have the getEpisodeInfo function implemented or an error happened -> ${error}`,
      );
      return [];
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
      console.error(
        `This scraper does not have the getChapterTitles function implemented or an error happened -> ${error}`,
      );
      if (includeEncodedTitle) {
        return {};
      } else {
        return [];
      }
    }
  }

  async getImgScans(mangaUrl, ...rest) {
    try {
      return await this.source.getImgScans(mangaUrl, ...rest);
    } catch (error) {
      console.error(
        `This scraper does not have the getImgScans function implemented or an error happened -> ${error}`,
      );
      return [];
    }
  }
}
