require('dotenv').config();
const {
  client
} = require('./Identification');

const {
  WebScraping
} = require('./WebScraping');

const minInMs = 60 * 1000;

class Giveaways {
  static channelID = process.env.GiveawaysID;

  constructor() {
    // Initiates giveaway functions
    this.channel = client.channels.cache.get(process.env.TestChanID);
    this.GetGiveaways();
    setInterval(this.GetGiveaways, 60 * minInMs);
  }

  static URL = { steam: 'https://steamcommunity.com/groups/GrabFreeGames/announcements/listing' };

  giveawaysCmdResponse(msg) {
    let message = 'This channel will be notified about giveaways';
    // Changes the giveaway channel and notifies about the change
    this.channel = msg.channel;
    this.channel.send(message);

    this.PostGiveaways();
  }

  GetGiveaways() {
    WebScraping.SimpleFetch(Giveaways.URL.steam).then(
      (val) => this.PostGiveaways(WebScraping.GetSteamAnnouncements(val))
    ).catch(
      (error) => {
        /* eslint-disable no-console */
        console.error('Failed to reach giveaway website');
        console.error(error);
        console.error();
        /* eslint-enable no-console */
      }
    );
  }

  // eslint-disable-next-line class-methods-use-this
  PostGiveaways(giveaways = []) {
    console.log(giveaways.length);
  }
}
exports.Giveaways = Giveaways;
