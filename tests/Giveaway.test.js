/* eslint-disable no-undef */
/* eslint-disable no-console */
import Giveaways from '../src/Giveaways.js';
import WebScraping from '../src/WebScraping.js';

const { giveawaySites } = Giveaways;
const giveawaySources = Object.keys(giveawaySites);
let givFetchResult = null; // Will be changed in beforeAll

function checkGiveaways(source, checkFunction) {
  expect(givFetchResult).not.toBeNull();
  const i = Object.keys(giveawaySites).indexOf(source);
  const src = givFetchResult[i];
  expect(src).not.toHaveLength(0);
  src.forEach(checkFunction);
}

function fetchGivSites() {
  const promises = [];

  Object.keys(giveawaySites).forEach((key) => {
    const { url, callback } = giveawaySites[key];
    promises.push(WebScraping.SimpleFetch(url).then(callback));
  });

  return Promise.all(promises);
}

beforeAll(async () => {
  givFetchResult = await fetchGivSites();
});

test('Tests if all http requests were handled', () => {
  givFetchResult.forEach((givSite) => {
    expect(givSite).not.toHaveLength(0);
  });
});

describe('Checks giveaway object properties', () => {
  function checkProperties(giveaway) {
    const properties = ['title', 'url', 'body']; // Required properties
    properties.forEach((prop) => {
      expect(giveaway).toHaveProperty(prop);
      expect(giveaway[prop]).not.toHaveLength(0);
    });
  }

  giveawaySources.forEach((source) => {
    test(`Test giveaway properties from ${source}`, () => {
      checkGiveaways(source, checkProperties);
    });
  });
});
