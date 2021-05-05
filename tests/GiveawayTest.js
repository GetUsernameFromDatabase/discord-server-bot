const {
  Giveaways
} = require('../src/Giveaways');
const {
  WebScraping
} = require('../src/WebScraping');

Object.keys(Giveaways.URL).forEach((key) => {
  let url = Giveaways.URL[key];
  WebScraping.SimpleFetch(url).then((val) => { WebScraping.GetSteamAnnouncements(val); });
});
