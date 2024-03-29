import * as cheerio from 'cheerio';
import { NodeHtmlMarkdown } from 'node-html-markdown';
import { Giveaway } from '../giveaway';

export abstract class BaseGiveawaySiteFetcher {
  abstract readonly url: string;

  abstract getGiveaways(): Promise<Giveaway[]>;

  protected cheerioLoad(
    data: string | cheerio.AnyNode | cheerio.AnyNode[] | Buffer
  ) {
    return cheerio.load(data, { scriptingEnabled: false }, false);
  }

  protected htmlToMarkdown(html: string) {
    const md = NodeHtmlMarkdown.translate(html);
    return md.trim();
  }
}
