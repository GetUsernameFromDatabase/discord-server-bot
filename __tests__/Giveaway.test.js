/* eslint-disable jest/no-mocks-import */
import { readFileSync } from 'fs';
import { jest } from '@jest/globals';
import axios from 'axios';
import * as Discord from 'discord.js';
import Giveaways from '../src/Giveaways.js';
import { ID } from '../src/Identification.js';
import * as WS from '../src/WebScraping.js';
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

const mockAxiosGet = jest.fn(() => {
  const response = {
    data: '<p class="article-content">This is a fake pharagraph</p>',
  };
  return Promise.resolve(response);
});

// jest.enableAutomock();
// jest.unmock('axios');
jest.mock('discord.js');

jest.spyOn(WS, 'SimpleFetch').mockImplementation(mockSimpleFetch);
jest.spyOn(axios, 'get').mockImplementation(mockAxiosGet);

ID.Server = new Discord.Guild(new Discord.Client());

/** @type {[Discord.TextChannel, Giveaways][]]} */
const channels = [];

async function WaitTillNoMessages(chan) {
  const wt = 200; // Wait Time in ms
  while (wt < Date.now() - (chan.lastMessage?.createdTimestamp || 0)) {
    // eslint-disable-next-line no-await-in-loop
    await new Promise((r) => setTimeout(r, wt));
  }
  return Promise.resolve('DONE WAITING');
}

describe('giveaway fetches', () => {
  let fetchCounter = 0;
  beforeEach(() => {
    // Clearing message collection before each was not robust enough
    const channel = new Discord.TextChannel(ID.Server);
    channels.push(channel);
    Giveaways.channelID = channel.id;

    // Previous source needs to fail in order for it to fallback to a different one
    for (let j = 0; j < fetchCounter; j++)
      mockSimpleFetch.mockRejectedValueOnce(`expect ${j} more failures`);
    fetchCounter++;
  });

  for (const source of Object.keys(givSites)) {
    const sourceInfo = givSites[source];
    test(`if got ${sourceInfo.count} giveaways from ${source}`, async () => {
      expect.assertions(2);

      const giv = new Giveaways();
      /** @type {import('discord.js').TextChannel} */
      const chan = giv.channel; // For type and eslint error

      await WaitTillNoMessages(chan);
      expect(chan.lastMessage.content).toBeDefined();
      expect(chan.messages.cache.size).toBe(sourceInfo.count);
    });
  }

  afterAll(() => {
    console.warn(fetchCounter);
    jest.autoMockOn();
    it('should post all giveaways from the last source into the first one', async () => {
      expect.assertions(1);
      console.warn('I need help'); // it's okay if this test fails - I JUST WANT IT TO BE CALLED AT LEAST
      // TODO: Get two different channels
      const lastChannel = Discord.TextChannel;

      givCmd.execute(
        new Discord.Message(prefix + givCmd.name, lastChannel, Discord.user)
      );
      await new Promise((r) => setTimeout(r, 500));

      const [[, first], [, last]] = Object.entries(givSites);
      expect(lastChannel.messages.cache.size).toBe(first.count + last.count);
    });
  });
});
