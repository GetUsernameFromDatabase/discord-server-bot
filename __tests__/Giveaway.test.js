/* eslint-disable jest/no-mocks-import */
// !!! This has to be commented out in order for this test to run
// import { jest } from '@jest/globals'; // * Useful during dev
import { readFileSync } from 'fs';
import axios from 'axios';
import { guild, TextChannel, Message, user } from '../__mocks__/discord.js';
import Giveaways from '../src/Giveaways.js';
import { ID, handlers } from '../src/Identification.js';
import { prefix } from '../src/commands/Commands.js';
import givCmd from '../src/commands/giveaways/changeGivChan.js';

const givSites = Giveaways.giveawaySites;
const resFolder = './__tests__/res/';
Object.assign(givSites.GrabFreeGames, {
  file: `${resFolder}GrabFreeGames_Copy.txt`,
  count: 13,
});
Object.assign(givSites.steam, {
  file: `${resFolder}SteamAnnouncements_Copy.txt`,
  count: 5,
});

const mockSimpleFetch = jest.fn((URL) => {
  const givSiteValues = Object.values(givSites).map(({ url, file }) => [
    url,
    file,
  ]);
  /** @type {[String, String]} [0]-**url** ; [1]-**file location** */
  const site = givSiteValues.find(([givURL]) => givURL === URL);
  const res = site ? readFileSync(site[1]) : 'Failed to read';
  return Promise.resolve(res);
});
const mockedWS = jest.requireActual('../src/WebScraping.js');
mockedWS.SimpleFetch = mockSimpleFetch;
jest.setMock('../src/WebScraping.js', mockedWS);

jest.mock('axios'); // Most likely won't help much
const mockAxiosGet = jest.fn(() => {
  const response = {
    data: '<p class="article-content">This is a fake pharagraph</p>',
  };
  return Promise.resolve(response);
});
jest.spyOn(axios, 'get').mockImplementation(mockAxiosGet);

ID.Server = guild;

/** @type {[TextChannel, Giveaways][]]} */
const channels = [];

async function WaitTillNoMessages(chan) {
  const wt = 200; // Wait Time in ms
  while (Date.now() - (chan.lastMessage?.createdTimestamp || 0) > wt) {
    // eslint-disable-next-line no-await-in-loop
    await new Promise((r) => setTimeout(r, wt));
  }
  return Promise.resolve('DONE WAITING');
}

describe('giveaway fetches', () => {
  beforeEach(() => {
    // Clearing message collection before each was not robust enough
    const channel = new TextChannel(guild);
    channels.push([channel, Giveaways]);
    Giveaways.channelID = channel.id;
  });

  for (const [i, source] of Object.keys(givSites).entries()) {
    const sourceInfo = givSites[source];
    test(`if got ${sourceInfo.count} giveaways from ${source}`, async () => {
      expect.assertions(2);
      // Previous source needs to fail in order for it to fallback to a different one
      for (let j = 0; j < i; j++)
        mockSimpleFetch.mockRejectedValueOnce(`expect ${j} more failures`);

      const giv = new Giveaways();
      /** @type {import('discord.js').TextChannel} */
      const chan = giv.channel; // For type and eslint error

      await WaitTillNoMessages(chan);
      expect(chan.lastMessage.content).toBeDefined();
      expect(chan.messages.cache.size).toBe(sourceInfo.count);
    });
  }
  afterAll(() => Promise.resolve());
});

afterAll(() => {
  // ?! This test is not called - at all
  it('should post all giveaways from the first source into the second one', async () => {
    expect.hasAssertions();
    console.error(channels[0][1]);
    handlers.Giveaways = channels[0][1];
    const scndChan = channels[1][0];
    givCmd.execute(new Message(prefix + givCmd.name, scndChan, user));

    await WaitTillNoMessages(scndChan);
    const [[, first], [, second]] = Object.entries(givSites);
    expect(scndChan.messages.cache.size).toBe(first.count + second.count);
  });
});
