import { existsSync, readFileSync, writeFileSync } from 'fs';
import { ID } from './Identification.js';
import Logging, { minInMs } from './Logging.js';
import { GetMsgEmbed, MassMessageSend } from './Messaging.js';
import {
  GrabFreeGames,
  GetSteamAnnouncements,
  SimpleFetch,
} from './WebScraping.js';

export default class Giveaways {
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

  static jsonLoc = './data/FetchedGiveaways.json';

  #channel;

  #channelChanged = false;

  constructor() {
    // process.env.TestChanID --- Testing | process.env.GiveawaysID --- For Use
    this.#channel = ID.Server.channels.cache.get(process.env.GiveawaysID);
    this.GetGiveaways();
    setInterval(this.GetGiveaways.bind(this), 60 * minInMs);
  }

  ChangeChannel(ChannelID) {
    // TODO: Make the change be saved (maybe save the channel ID in .env)
    if (this.#channel?.id !== ChannelID) this.#channelChanged = true;
    this.#channel = ID.Server.channels.cache.get(ChannelID);
  }

  async GetGiveaways() {
    const sources = Object.keys(Giveaways.giveawaySites);
    for (const key of sources) {
      const source = Giveaways.giveawaySites[key];
      // eslint-disable-next-line no-await-in-loop
      const results = await SimpleFetch(source.url)
        .then((val) => source.callback(val))
        .catch((error) => Logging.Error(error, `${source}: FAILED`));

      if (typeof results !== 'undefined' && results.length > 0) {
        this.#PostGiveaways(results);
        return true;
      }
    }
    Logging.Error(new Error('No giveaways were found'));
    return false;
  }

  /** Filters out sent giveaways from fetched giveaways
   * @param {import('./interfaces/giveaways').GiveawayArray} FetchedGiveaways */
  static #FilterSentGiveaways(FetchedGiveaways) {
    const encoding = 'utf8';
    let FileJSON = '[]';
    if (existsSync(Giveaways.jsonLoc))
      FileJSON = readFileSync(Giveaways.jsonLoc, encoding) || FileJSON;

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

    writeFileSync(
      Giveaways.jsonLoc,
      JSON.stringify(data, undefined, 2),
      encoding
    );
    return toSend;
  }

  /** @param {import('./interfaces/giveaways').GiveawayArray} FetchedGiveaways */
  #PostGiveaways(FetchedGiveaways) {
    let giveaways = FetchedGiveaways;
    if (!this.#channelChanged) {
      this.#channelChanged = !this.#channelChanged;
      giveaways = Giveaways.#FilterSentGiveaways(FetchedGiveaways);
    }
    // Reversing this to make newer (front of array) giveaways
    // be sent last as the newest message
    const embGiveaways = giveaways.reverse().map((giv) => {
      const { body, ...rest } = giv;
      return GetMsgEmbed(body, rest);
    });
    MassMessageSend(this.#channel, embGiveaways);
  }
}
