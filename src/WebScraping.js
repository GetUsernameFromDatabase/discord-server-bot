const axios = require('axios').default;
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
    var $ = cheerio.load(html.trim(), { decodeEntities: true }, false);
    // Turns hyperlinks into MD links
    $('a').each((_i, el) => {
      const $el = $(el);
      $el.replaceWith(`[${$el.text()}](${$el.attr('href')})`);
    });
    // Turns breaks into newlines
    $('br').each((_i, el) => { $(el).replaceWith('\n'); });

    // Converts <i> => _italic_ and <b> => **bold** (they need to be seperate
    //  could be because replaceWith makes changes to children as well)
    // - SF most use cases have had an * already in html, so using _ for i
    $('i').each((_i, el) => { $(el).replaceWith(`_${$(el).html()}_`); });
    $('b').each((_i, el) => { $(el).replaceWith(`**${$(el).html()}**`); });

    // Headings into MD
    const headingCSS = 'h1, h2, h3, h4, h5, h6'
      .concat(', .bb_h1'); // heading class I've seen used in steam
    $(headingCSS).each((_i, el) => {
      // Helps find problems if something has more than 6 #
      const rgx = /\d*\d/;

      const hLevel = rgx.test(el.tagName)
        ? rgx.exec(el.tagName)[0] : rgx.exec(el.attribs.class)?.[0];
      // replaceWith is fine since headings aren't nested
      // - (class variant could pose a problem)
      $(el).replaceWith(`${'#'.repeat(hLevel)} ${$(el).html()}\n`);
    });
    console.log($.html());
    return $;
  }
}

exports.WebScraping = WebScraping;
