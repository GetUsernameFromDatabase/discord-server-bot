import { ID } from './Identification.js';
import { GetMsgEmbed, MassMessageSend } from './Messaging.js';
import Logging, { minInMs } from './Logging.js';
import {
  GiveawaysFromGrabFreeGames,
  GetSteamAnnouncements,
  SimpleFetch,
} from './WebScraping.js';

export default class Giveaways {
  static channelID = process.env.GiveawaysID;

  static giveawaySites = {
    grabFreeGames: {
      url: 'https://grabfreegames.com/free',
      callback: GiveawaysFromGrabFreeGames,
    },
    steam: {
      url:
        'https://steamcommunity.com/groups/GrabFreeGames/announcements/listing?',
      callback: GetSteamAnnouncements,
    },
  };

  constructor() {
    // Initiates giveaway functions
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
        .catch((err) => Logging.Error(err, `${source}: FAILED`));

      if (typeof results !== 'undefined' && results.length !== 0) {
        this.PostGiveaways(results);
        return true;
      }
    }
    Logging.Error(new Error('No giveaways were found'));
    return false;
  }

  /** @param {{title:String, url: String, body: String, imageURL: String|undefined}[]} giveaways */
  PostGiveaways(giveaways = []) {
    // Reversing this to make newer (top of array) giveaways
    // be sent last as the newest message
    const embGiveaways = giveaways.reverse().map((giv) => {
      const { body, imageURL, ...title } = giv;
      return GetMsgEmbed(body, title, imageURL);
    });
    MassMessageSend(this.channel, embGiveaways);
  }
}
