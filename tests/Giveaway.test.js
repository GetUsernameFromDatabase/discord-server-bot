/* eslint-disable no-undef */
const {
  Giveaways
} = require('../src/Giveaways');
const {
  WebScraping
} = require('../src/WebScraping');

describe('Testing giveaway module', () => {
  test('Testing if giveaways have been found', (done) => {
    function checkGiveaway(data) {
      try {
        let giveaways = WebScraping.GetSteamAnnouncements(data);
        expect(giveaways.length).not.toBe(0);
        done();
      } catch (error) {
        done(error);
      }
    }

    Object.keys(Giveaways.URL).forEach((key) => {
      let url = Giveaways.URL[key];
      // Return SimpleFetch<Promise> did not work
      WebScraping.SimpleFetch(url).then(checkGiveaway);
    });
  });
});
