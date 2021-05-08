const axios = require('axios').default;
const cheerio = require('cheerio');
const TurndownService = require('turndown');

class WebScraping {
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
   * @returns {{title: String, url: String, body: String}[]} an array of announcements
   */
  static GetSteamAnnouncements(html) {
    const announcements = [];
    const $ = cheerio.load(html, { decodeEntities: true });
    $('div.announcement').each((_i, el) => {
      let body = $(el).find('div.bodytext');
      body.find('blockquote.bb_blockquote').replaceWith();
      body = WebScraping.HTMLIntoMD(body.html());

      const annTitle = $(el).children().first();
      announcements.push({
        title: annTitle.text(),
        url: annTitle.attr('href'),
        body,
      });
    });
    return announcements;
  }

  static HTMLIntoMD(html = '') {
    const $ = cheerio.load(html, { decodeEntities: true }, false);
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

exports.WebScraping = WebScraping;
