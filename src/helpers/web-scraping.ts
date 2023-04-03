import type { GiveawayObject } from '@/giveaways.js';
import axios from 'axios';
import { Element, load } from 'cheerio';
import TurndownService from 'turndown';
import { ModifyCredits } from './text-manipulation';

// TODO: Convert to undici https://www.npmjs.com/package/undici

export function SimpleFetch<T>(URL: string) {
  return axios
    .get<T>(URL)
    .then((response) => response.data)
    .catch((error) => {
      throw error;
    });
}

function HTMLIntoMD(html = '') {
  const $ = load(html, { scriptingEnabled: false }, false);
  // So that turndown would convert them properly
  const headingCSS = '.bb_h1'; // heading class I've seen used in steam
  $(headingCSS).each((_index, element) => {
    const hLevel = /h\d/.exec(element.attribs.class)?.[0][1];
    if (hLevel)
      $(element).replaceWith(
        `<h${hLevel}>${$(element).html() ?? ''}</h${hLevel}>`
      );
  });

  const turndownService = new TurndownService({
    bulletListMarker: '-',
    headingStyle: 'atx', // MD headings with # not underlying =*13
  });
  return turndownService.turndown($.html());
}

/**
 * Gets giv announcements from steamcommunity.com/.../announcements/?
 */
export function GetSteamAnnouncements(html: string) {
  const announcements: GiveawayObject[] = [];
  const $ = load(html, { scriptingEnabled: false });
  $('div.announcement').each((_index, element) => {
    const annTitle = $(element).children().first();
    const title = annTitle.text();
    const url = annTitle.attr('href') ?? '';

    const body = $(element).find('div.bodytext');
    body.find('blockquote.bb_blockquote').replaceWith('');
    let bodyAsMD = HTMLIntoMD(body.html() ?? '');
    bodyAsMD = ModifyCredits(bodyAsMD, url);

    announcements.push({ title, url, body: bodyAsMD });
  });
  return announcements;
}

/** Gets giveaways from grabfreegames.com*/
export function GrabFreeGames(html: string) {
  async function giveawayFromSection(element: Element) {
    const { src: imgURL, alt: title } = element.attribs;
    const url = element.parent ? $(element.parent).attr('href') ?? '' : '';

    const bodyCSS = 'p.article-content';
    const body = await SimpleFetch<string>(url)
      .then((value) => {
        const article = load(
          value,
          { scriptingEnabled: false },
          false
        )(bodyCSS).html();

        const response =
          article ?? Promise.reject(new Error("Couldn't get article content"));
        return response;
      })
      .then(HTMLIntoMD)
      .catch(console.error);
    const giveaway: GiveawayObject = {
      title,
      url,
      body: body ?? '',
      imageURL: imgURL,
    };
    return giveaway;
  }

  const promises: Promise<GiveawayObject>[] = [];
  const $ = load(html, { scriptingEnabled: false }, false);

  for (const element of $('div.free-image > a > img')) {
    promises.push(giveawayFromSection(element));
  }
  return Promise.all(promises);
}
