const axios = require('axios').default;
const cheerio = require('cheerio');
const TurndownService = require('turndown');

class WebScraping {
  // FormatSymbolsIntoHTML method makes it acocount for tml tag format (<x> and </x>)
  static SimpleFetch(URL) {
    return axios.get(URL)
      .then((response) => {
        // eslint-disable-next-line no-undef
        return Promise.resolve(response.data);
      })
      .catch((error) => {
        // eslint-disable-next-line no-undef
        return Promise.reject(error);
      });
  }

  /* eslint-disable no-console */
  static GetSteamAnnouncements(html) {
    var announcements = [];

    var $ = cheerio.load(html, { decodeEntities: true });
    $('div.announcement').each((_i, el) => {
      let body = $(el).find('div.bodytext');
      body.find('blockquote.bb_blockquote').replaceWith();
      // The body has leading and trailing spaces
      body = WebScraping.HTMLIntoMD(body.html());
      // console.log(body.html() + '\n');

      let annTitle = $(el).children().first();
      announcements.push({
        title: annTitle.text(),
        url: annTitle.attr('href'),
        body: body
      });
    });
    return announcements;
  }

  static HTMLIntoMD(html = '') {
    const turndownService = new TurndownService({ bulletListMarker: '-' });
    var md = turndownService.turndown(html);
    return md;
  }
}

exports.WebScraping = WebScraping;
