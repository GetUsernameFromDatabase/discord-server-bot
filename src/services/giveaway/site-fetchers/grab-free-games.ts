import { BaseGiveawaySiteFetcher } from './base';
import { GiveawayObject } from '../giveaway';
import * as cheerio from 'cheerio';
import { fetch, FetchResultTypes } from '@sapphire/fetch';

/**
 * TODO: create test cases for this
 */
class GrabFreeGamesSiteFetcher extends BaseGiveawaySiteFetcher {
  url = 'https://grabfreegames.com/free';

  async getGiveaways() {
    const data = await fetch(this.url, FetchResultTypes.Text);
    const $ = this.cheerioLoad(data);

    const giveawayPromises = [];
    for (const element of $('div.free-image > a > img')) {
      giveawayPromises.push(this.giveawayFromSection($, element));
    }

    const giveaways = await Promise.all(giveawayPromises);
    return giveaways.filter(Boolean) as GiveawayObject[];
  }

  private getContentFromArticle(article: string) {
    const bodyCSS = 'p.article-content';
    const parsedArticle = this.cheerioLoad(article)(bodyCSS).html();
    return parsedArticle;
  }

  private async giveawayFromSection(
    $: cheerio.CheerioAPI,
    element: cheerio.Element
  ) {
    const { src: imgURL, alt: title } = element.attribs;
    const url = element.parent ? $(element.parent).attr('href') ?? '' : '';

    const body = await fetch(url, FetchResultTypes.Text)
      .then((value) => {
        const article = this.getContentFromArticle(value);
        if (!article) throw new Error("Couldn't get article content");
        return article;
      })
      .catch((error) => globalThis.logger.error(error));
    if (typeof body !== 'string') return;

    const mdBody = this.htmlToMarkdown(body);
    const giveaway: GiveawayObject = {
      title,
      url,
      body: mdBody,
      imageURL: imgURL,
    };
    return giveaway;
  }
}

export default new GrabFreeGamesSiteFetcher();
