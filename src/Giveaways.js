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

  /** @param {{title:String, url: String, body: String, imageURL: String|undefined}[]} giveaways */
  PostGiveaways(giveaways = []) {
    // Reversing this to make newer (front of array) giveaways
    // be sent last as the newest message
    const embGiveaways = giveaways.reverse().map((giv) => {
      const { body, ...rest } = giv;
      return GetMsgEmbed(body, rest);
    });
    MassMessageSend(this.channel, embGiveaways);
  }
}
