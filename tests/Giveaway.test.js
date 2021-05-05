/* eslint-disable no-console */
/* eslint-disable no-undef */
const {
  Giveaways
} = require('../src/Giveaways');
const {
  WebScraping
} = require('../src/WebScraping');

const giveawaySites = Giveaways.giveawaySites;
var givFetchResult = null;
function fetchGivSites() {
  var promises = [];

  Object.keys(giveawaySites).forEach((key) => {
    let url = giveawaySites[key].url;
    let callback = giveawaySites[key].callback;
    promises.push(WebScraping.SimpleFetch(url).then(callback));
  });

  return Promise.all(promises);
}

beforeAll(async () => {
  givFetchResult = await fetchGivSites();
});

test('Tests if all http requests were handled', ()=> {
  givFetchResult.forEach((givSite) => {
    expect(givSite).not.toHaveLength(0);
  });
});

describe('Checks giveaway object properties', () => {
  function checkProperties(giveaway) {
    const properties = ['title', 'url', 'body'];
    properties.forEach((prop) => {
      expect(giveaway).toHaveProperty(prop);
      expect(giveaway[prop]).not.toHaveLength(0);
    });
  }
  function checkGiveaways(source) {
    let i = Object.keys(giveawaySites).indexOf(source);
    let src = givFetchResult[i];
    expect(src).not.toHaveLength(0);
    src.forEach(checkProperties);
  }

  // I check giveaways in a semi hard-coded way since:
  // - cannot iterate over givFetchResults - defined in before all
  // - - it needs to be defined in before all since tests should be run synchronously
  // - nested loops are not allowed which would quarantee givFetchResults to be resolved
  test('Test giveaway properties from steam', () => {
    checkGiveaways('steam');
  });
});
