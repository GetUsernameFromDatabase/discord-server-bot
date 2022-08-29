import { existsSync, readFileSync, writeFileSync } from 'fs';
import Logging, { minInMs } from './Logging.js';
import { GetMsgEmbed, MassMessageSend } from './client/Messaging.js';
import { ID } from './helpers/Identification.js';
import {
  GrabFreeGames,
  GetSteamAnnouncements,
  SimpleFetch,
} from './services/WebScraping.js';

export const givFile = {
  location: './data/FetchedGiveaways.json',
  encoding: 'utf8',
};

export default class Giveaways {
  static giveawaySites = {
    GrabFreeGames: {
      url: 'https://grabfreegames.com/free',
      callback: GrabFreeGames,
    },
    steam: {
      url: 'https://steamcommunity.com/groups/GrabFreeGames/announcements/listing?',
      callback: GetSteamAnnouncements,
    },
  };

  channelChanged = false;

  #channel;

  constructor() {
    // process.env.TestChanID --- Testing | process.env.GiveawaysID --- For Use
    this.#channel = ID.Server.channels.cache.get(process.env.TestChanID);
    this.GetGiveaways();
    setInterval(this.GetGiveaways.bind(this), 60 * minInMs);
  }

  ChangeChannel(ChannelID) {
    // TODO: Make the change be saved (maybe save the channel ID in .env)
    if (this.#channel?.id !== ChannelID) {
      this.channelChanged = true;
      this.#channel = ID.Server.channels.cache.get(ChannelID);
    }
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
  static FilterSentGiveaways(FetchedGiveaways) {
    let FileJSON = '[]';
    if (existsSync(givFile.location))
      FileJSON = readFileSync(givFile.location, givFile.encoding);

    /** @type {import('./interfaces/giveaways').FetchedGiveawaysJSON}  */
    const data = JSON.parse(FileJSON);
    const savedGiveaways = data.map(({ title }) => title.toLowerCase());

    const FilteredGiveaways = [];
    const jsonUpdate = data; // dataUpdate is a pointer to data
    for (const giv of FetchedGiveaways) {
      const { title, url } = giv;
      const i = savedGiveaways.indexOf(title.toLowerCase());
      const now = Date.now();

      if (i !== -1) jsonUpdate[i].updated_date = now;
      else {
        FilteredGiveaways.push(giv);
        jsonUpdate.push({ title, url, created_date: now, updated_date: now });
      }
    }
    return { FilteredGiveaways, jsonUpdate };
  }

  static #UpdateGiveawayJSONFile(JSONObj) {
    writeFileSync(
      givFile.location,
      JSON.stringify(JSONObj, undefined, 2),
      givFile.encoding
    );
  }

  /** @param {import('./interfaces/giveaways').GiveawayArray} FetchedGiveaways */
  #PostGiveaways(FetchedGiveaways) {
    const givFilter = Giveaways.FilterSentGiveaways;
    // Reversing this to make newer (front of array) giveaways
    // be sent last as the newest message
    let giveaways = FetchedGiveaways.reverse();

    let filterResult;
    if (!this.channelChanged) {
      filterResult = givFilter(FetchedGiveaways);
      giveaways = filterResult.FilteredGiveaways;
    } else this.channelChanged = false;

    const embGiveaways = giveaways.map((giv) => {
      const { body, ...rest } = giv;
      return GetMsgEmbed(body, rest);
    });

    if (MassMessageSend(this.#channel, embGiveaways)) {
      if (filterResult && this.#channel.id !== process.env.TestChanID)
        Giveaways.#UpdateGiveawayJSONFile(filterResult.jsonUpdate);
      Logging.Log('Giveaway fetch successful');
    } else Logging.Error('Giveaway fetch FAILED');
  }
}
