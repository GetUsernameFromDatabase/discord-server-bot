const { client } = require('./Identification');
const { WebScraping } = require('./WebScraping');
const { Messaging } = require('./Messaging');
const { Logging } = require('./Logging');

const minInMs = 60 * 1000;

class Giveaways {
  static channelID = process.env.GiveawaysID;

  constructor() {
    // Initiates giveaway functions
    this.channel = client.channels.cache.get(process.env.TestChanID);
    this.GetGiveaways();
    setInterval(this.GetGiveaways, 60 * minInMs);
  }

  static giveawaySites = {
    steam: {
      url:
        'https://steamcommunity.com/groups/GrabFreeGames/announcements/listing?p=7',
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

  // eslint-disable-next-line class-methods-use-this
  PostGiveaways(giveaways = []) {
    giveaways.forEach((giv) => {
      const msg = Messaging.GetEmbeddedMsg(giv.title, giv.url, giv.body);
      Logging.Log(msg);
    });
  }
}
exports.Giveaways = Giveaways;
