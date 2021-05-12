import axios from 'axios';
import { load } from 'cheerio';
import TurndownService from 'turndown';

import Logging from './Logging.js';
import { ModifyCredits } from './TextManipulation.js';

export default class WebScraping {
  /**
   * @param {String} URL The url for get request
   * @returns {Promise<any>} Get request promise
   */
  static SimpleFetch(URL) {
    return axios
      .get(URL)
      .then((response) => Promise.resolve(response.data))
      .catch((error) => Promise.reject(error));
  }

  /**
   * Gets giv announcements from steamcommunity.com/.../announcements/?
   * @param {String} html
   * @returns {{title: String, url: String, body: String}[]} Steam announcements
   */
  static GetSteamAnnouncements(html) {
    const announcements = [];
    const $ = load(html, { decodeEntities: true });
    $('div.announcement').each((_i, el) => {
      const annTitle = $(el).children().first();
      const title = annTitle.text();
      const url = annTitle.attr('href');

      let body = $(el).find('div.bodytext');
      body.find('blockquote.bb_blockquote').replaceWith();
      body = WebScraping.HTMLIntoMD(body.html());
      body = ModifyCredits(body);

      announcements.push({ title, url, body });
    });
    return announcements;
  }

  /**
   * Gets giveaways from grabfreegames.com
   * @param {String} html
   * @returns {{title: String, url: String, body: String, imageURL: String}[]} Giveaways from GrabFreeGames
   */
  static async GiveawaysFromGrabFreeGames(html) {
    /** @type {{title: String,url:String, body:Promise<String> imageURL: String}[]} */
    const giveaways = [];

    const $ = load(html, { decodeEntities: true }, false);
    $('div.free-image > a > img').each((_i, el) => {
      const { src: imgURL, alt: title } = el.attribs;
      const url = $(el.parent).attr('href');

      const bodyCSS = 'p.article-content';
      const body = WebScraping.SimpleFetch(url)
        .then((val) =>
          load(val, { decodeEntities: true }, false)(bodyCSS).html()
        )
        .then(WebScraping.HTMLIntoMD)
        .catch(Logging.Error);

      giveaways.push({ title, url, body, imageURL: imgURL });
    });

    const resolvedGiv = [];
    for (let i = 0; i < giveaways.length; i++) {
      const giv = giveaways[i];
      // eslint-disable-next-line no-await-in-loop
      giv.body = await giv.body;
      if (typeof giv.body !== 'undefined') {
        resolvedGiv.push(giv);
      }
    }
    return resolvedGiv;
  }

  static HTMLIntoMD(html = '') {
    const $ = load(html, { decodeEntities: true }, false);
    // So that turndown would convert them properly
    const headingCSS = '.bb_h1'; // heading class I've seen used in steam
    $(headingCSS).each((_i, el) => {
      const hLevel = /h\d/.exec(el.attribs.class)?.[0][1];
      if (hLevel) $(el).replaceWith(`<h${hLevel}>${$(el).html()}</h${hLevel}>`);
    });

    const turndownService = new TurndownService({
      bulletListMarker: '-',
      headingStyle: 'atx', // MD headings with # not underlying =*13
    });
    return turndownService.turndown($.html());
  }
}
