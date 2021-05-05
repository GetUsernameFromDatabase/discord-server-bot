const axios = require('axios');
const cheerio = require('cheerio');

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

  static GetSteamAnnouncements(html) {
    /* eslint-disable no-console */
    var announcements = [];
    var $ = cheerio.load(html, { decodeEntities: true });
    $('div.announcement').each((_i, el) => {
      let body = $(el).find('div.bodytext');
      body.find('blockquote.bb_blockquote').replaceWith();
      // The body has leading and trailing spaces
      body = cheerio.load(body.html().trim(), { decodeEntities: true }, false);
      console.log(body.children());

      let annTitle = $(el).children().first();
      announcements.push({
        title: annTitle.text(),
        url: annTitle.attr('href'),
        body: body
      });
    });
    return announcements;
  }
}

exports.WebScraping = WebScraping;
