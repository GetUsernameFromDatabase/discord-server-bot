const { ID } = require('./Identification');
const { WebScraping } = require('./WebScraping');
const { Messaging } = require('./Messaging');
const { Logging } = require('./Logging');

const minInMs = 60 * 1000;

class Giveaways {
  static channelID = process.env.GiveawaysID;

  constructor() {
    // Initiates giveaway functions
    // TODO: CHANGE \/ this.channel = ID.Server.channels.cache.get(Giveaways.channelID); after testing
    this.channel = ID.Server.channels.cache.get(process.env.TestChanID);
    this.GetGiveaways();
    setInterval(this.GetGiveaways, 60 * minInMs);
  }

  static giveawaySites = {
    grabFreeGames: {
      url: 'https://grabfreegames.com/',
      callback: WebScraping.GetSteamAnnouncements,
    },
    steam: {
      url:
        'https://steamcommunity.com/groups/GrabFreeGames/announcements/listing?',
      callback: WebScraping.GetSteamAnnouncements,
    },
  };

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
      const fetch = await WebScraping.SimpleFetch(source.url)
        .then((val) => source.callback(val))
        .catch((err) => Logging.Error(err, 'Failed to reach giveaway website'));

      if (typeof fetch !== 'undefined' && fetch.length !== 0) {
        this.PostGiveaways(fetch);
        return true;
      }
    }
    Logging.Error(new Error('No giveaways were found'));
    return false;
  }

  /**
   * @param {{title:String, url: String, body: String}[]} giveaways
   */
  PostGiveaways(giveaways = []) {
    /**
     * @param {String} body String where the credit is
     * @param {String} referenceURL CreditURL
     * @returns {String} Modified string
     */
    function modifyCredits(body, referenceURL) {
      let newBody = null;
      const credit = body.split('\n').pop();
      if (credit.includes(' join our ')) {
        const newCredit = `Information taken from:\n${referenceURL}`;
        newBody = body.replace(credit, newCredit);
      }
      return newBody || body;
    }

    const embGiveaways = giveaways.reverse().map((giv) => {
      const { body, imageURL, ...title } = giv;
      return Messaging.GetEmbeddedMsg(
        modifyCredits(body, giv.url),
        title,
        imageURL
      );
    });
    Messaging.MassMessageSend(this.channel, embGiveaways);
  }
}
exports.Giveaways = Giveaways;
