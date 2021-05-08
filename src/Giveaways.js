const { ID } = require('./Identification');
const { WebScraping } = require('./WebScraping');
const { Messaging } = require('./Messaging');
const { Logging } = require('./Logging');

const minInMs = 60 * 1000;

class Giveaways {
  static channelID = process.env.GiveawaysID;

  constructor() {
    // Initiates giveaway functions
    this.channel = ID.Server.channels.cache.get(Giveaways.channelID);
    this.GetGiveaways();
    setInterval(this.GetGiveaways, 60 * minInMs);
  }

  static giveawaySites = {
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

  // TODO: Have multiple giveaway sites to switch between should there be an error
  GetGiveaways() {
    const { steam } = Giveaways.giveawaySites;
    WebScraping.SimpleFetch(steam.url)
      .then((val) => this.PostGiveaways(steam.callback(val)))
      .catch((error) =>
        Logging.Error(error, 'Failed to reach giveaway website')
      );
  }

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
      const { body, ...title } = giv;
      return Messaging.GetEmbeddedMsg(modifyCredits(body, giv.url), title);
    });
    Messaging.MassMessageSend(this.channel, embGiveaways);
  }
}
exports.Giveaways = Giveaways;
