import * as cheerio from 'cheerio';
import { NodeHtmlMarkdown } from 'node-html-markdown';

export interface GiveawayObject {
  title: string;
  url: string;
  body: string;
  imageURL?: string;
}

export abstract class BaseGiveawaySite {
  abstract readonly url: string;

  abstract getGiveaways(): Promise<GiveawayObject[]>;

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
