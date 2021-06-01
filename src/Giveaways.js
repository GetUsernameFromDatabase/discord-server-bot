import { readFileSync, writeFileSync } from 'fs';
import { ID } from './Identification.js';
import Logging, { minInMs } from './Logging.js';
import { GetMsgEmbed, MassMessageSend } from './Messaging.js';
import {
  GrabFreeGames,
  GetSteamAnnouncements,
  SimpleFetch,
} from './WebScraping.js';

export default class Giveaways {
  static channelID = process.env.GiveawaysID;

  static giveawaySites = {
    GrabFreeGames: {
      url: 'https://grabfreegames.com/free',
      callback: GrabFreeGames,
    },
    steam: {
      url:
        'https://steamcommunity.com/groups/GrabFreeGames/announcements/listing?',
      callback: GetSteamAnnouncements,
    },
  };

  constructor() {
    // process.env.TestChanID --- Testing | Giveaways.channelID --- For Use
    this.channel = ID.Server.channels.cache.get(Giveaways.channelID);
    this.GetGiveaways();
    setInterval(this.GetGiveaways.bind(this), 60 * minInMs);
  }

  async GetGiveaways() {
    const sources = Object.keys(Giveaways.giveawaySites);
    for (let i = 0; i < sources.length; i++) {
      const source = Giveaways.giveawaySites[sources[i]];
      // eslint-disable-next-line no-await-in-loop
      const results = await SimpleFetch(source.url)
        .then((val) => source.callback(val))
        .catch((error) => Logging.Error(error, `${source}: FAILED`));

      if (typeof results !== 'undefined' && results.length > 0) {
        this.PostGiveaways(results);
        return true;
      }
    }
    Logging.Error(new Error('No giveaways were found'));
    return false;
  }

  /** Filters out sent giveaways from fetched giveaways
   * @param {import('./interfaces/giveaways').GiveawayArray} FetchedGiveaways */
  static FilterSentGiveaways(FetchedGiveaways) {
    const encoding = 'utf8';
    const jsonLoc = `${process.cwd()}/data/FetchedGiveaways.json`;
    const FileJSON = readFileSync(jsonLoc, encoding) || '[]';

    /** @type {import('./interfaces/giveaways').FetchedGiveawaysJSON}  */
    const data = JSON.parse(FileJSON);
    const savedGiveaways = data.map(({ title }) => title.toLowerCase());

    const toSend = [];
    const updatedData = data;
    for (const giv of FetchedGiveaways) {
      const { title, url } = giv;
      const i = savedGiveaways.indexOf(title.toLowerCase());
      const now = Date.now();

      if (i !== -1) updatedData[i].updated_date = now;
      else {
        toSend.push(giv);
        updatedData.push({ title, url, created_date: now, updated_date: now });
      }
    }
    writeFileSync(jsonLoc, JSON.stringify(data, undefined, 2), encoding);
    return toSend;
  }

  /** @param {import('./interfaces/giveaways').GiveawayArray} FetchedGiveaways */
  PostGiveaways(FetchedGiveaways) {
    const giveaways = Giveaways.FilterSentGiveaways(FetchedGiveaways);
    // Reversing this to make newer (front of array) giveaways
    // be sent last as the newest message
    const embGiveaways = giveaways.reverse().map((giv) => {
      const { body, ...rest } = giv;
      return GetMsgEmbed(body, rest);
    });
    MassMessageSend(this.channel, embGiveaways);
  }
}
