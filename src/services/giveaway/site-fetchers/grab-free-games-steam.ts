import { BaseGiveawaySiteFetcher } from './base';
import { GiveawayObject } from '../giveaway';
import { fetch, FetchResultTypes } from '@sapphire/fetch';

/**
 * This implementation is not in active use therefore might not be reliable
 *
 * TODO: create test cases for this
 */
class GrabFreeGamesSteamSiteFetcher extends BaseGiveawaySiteFetcher {
  url =
    'https://steamcommunity.com/groups/GrabFreeGames/announcements/listing?';

  async getGiveaways() {
    const data = await fetch(this.url, FetchResultTypes.Text);
    const $ = this.cheerioLoad(data);
    const announcements: GiveawayObject[] = [];

    for (const element of $('div.announcement')) {
      const annTitle = $(element).children().first();
      const title = annTitle.text();
      const url = annTitle.attr('href') ?? '';

      const body = $(element).find('div.bodytext');
      body.find('blockquote.bb_blockquote').replaceWith('');
      const html = body.html();
      if (!html) continue;

      let mdBody = this.htmlToMarkdown(html);
      mdBody = this.modifyCredits(mdBody, url);
      announcements.push({ title, url, body: mdBody });
    }
    return announcements;
  }

  private modifyCredits(body: string, referenceURL: string): string {
    let modifiedBody;
    const credit = body.split('\n').pop() ?? '';
    if (credit.includes(' join our ')) {
      const modifiedCredit = `Information taken from:\n${referenceURL}`;
      modifiedBody = body.replace(credit, modifiedCredit);
    }
    return modifiedBody ?? body;
  }
}

export default new GrabFreeGamesSteamSiteFetcher();
