import { ID } from './Identification.js';
import WebScraping from './WebScraping.js';
import Messaging from './Messaging.js';
import Logging from './Logging.js';

export default class Giveaways {
  static channelID = process.env.GiveawaysID;

  static giveawaySites = {
    grabFreeGames: {
      url: 'https://grabfreegames.com/free',
      callback: WebScraping.GiveawaysFromGrabFreeGames,
    },
    steam: {
      url:
        'https://steamcommunity.com/groups/GrabFreeGames/announcements/listing?',
      callback: WebScraping.GetSteamAnnouncements,
    },
  };

  constructor() {
    // Initiates giveaway functions
    // process.env.TestChanID --- Testing | Giveaways.channelID --- For Use
    this.channel = ID.Server.channels.cache.get(Giveaways.channelID);
    this.GetGiveaways();
    setInterval(this.GetGiveaways, 60 * Logging.minInMs);
  }

  giveawaysCmdResponse(msg) {
    const message = 'This channel will be notified about giveaways';
    // Changes the giveaway channel and notifies about the change
    this.channel = msg.channel;
    this.channel.send(message);

    this.PostGiveaways();
  }

  async GetGiveaways() {
    const sources = Object.keys(Giveaways.giveawaySites);
    for (let i = 0; i < sources.length; i++) {
      const source = Giveaways.giveawaySites[sources[i]];
      // eslint-disable-next-line no-await-in-loop
      const results = await WebScraping.SimpleFetch(source.url)
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

  /**
   * @param {{title:String, url: String, body: String, imageURL: String|undefined}[]} giveaways
   */
  PostGiveaways(giveaways = []) {
    /**
     * @param {String} body String where the credit is
     * @param {String} referenceURL CreditURL
     * @returns {String} Modified string
     */

    // Reversing this to make newer (top of array) giveaways
    // be sent last as the newest message
    const embGiveaways = giveaways.reverse().map((giv) => {
      const { body, imageURL, ...title } = giv;
      return Messaging.GetEmbeddedMsg(body, title, imageURL);
    });
    Messaging.MassMessageSend(this.channel, embGiveaways);
  }
}
