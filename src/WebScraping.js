const axios = require('axios').default;
const cheerio = require('cheerio');
const TurndownService = require('turndown');

class WebScraping {
  // FormatSymbolsIntoHTML method makes it acocount for tml tag format (<x> and </x>)
  static SimpleFetch(URL) {
    return axios
      .get(URL)
      .then((response) => Promise.resolve(response.data))
      .catch((error) => Promise.reject(error));
  }

  static GetSteamAnnouncements(html) {
    const announcements = [];
    const $ = cheerio.load(html, { decodeEntities: true });
    $('div.announcement').each((_i, el) => {
      let body = $(el).find('div.bodytext');
      body.find('blockquote.bb_blockquote').replaceWith();
      // The body has leading and trailing spaces
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
    const turndownService = new TurndownService({ bulletListMarker: '-' });
    const md = turndownService.turndown(html);
    return md;
  }
}

exports.WebScraping = WebScraping;
