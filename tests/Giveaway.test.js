/* eslint-disable no-undef */
/* eslint-disable no-console */
import { jest } from '@jest/globals';
import { readFileSync } from 'fs';
import { guild, TextChannel } from './DiscordMock.js';
import Giveaways from '../src/Giveaways.js';
import * as WS from '../src/WebScraping.js';
import { ID } from '../src/Identification.js';

ID.Server = guild;

const givSites = Giveaways.giveawaySites;
Object.assign(givSites.GrabFreeGames, {
  file: './tests/Websites/GrabFreeGames_Copy.html',
  count: 13,
});
Object.assign(givSites.steam, {
  file: './tests/Websites/SteamAnnouncements_Copy.html',
  count: 5,
});

const mockFetch = jest
  .fn((URL) => {
    const givSiteValues = Object.values(givSites).map(({ url, file }) => [
      url,
      file,
    ]);

    const site = givSiteValues.find(([givURL]) => givURL === URL);
    const res = site ? readFileSync(site[1]) : undefined;
    return Promise.resolve(res);
  })
  .mockName('SimpleFetch mock');
WS.SimpleFetch = mockFetch;

beforeEach(() => {
  // Clearing message collection before each was not robust enough
  const channel = new TextChannel(guild);
  Giveaways.channelID = channel.id;
});

describe('giveaway fetches', () => {
  Object.keys(givSites).forEach((source, i) => {
    const sourceInfo = givSites[source];
    test(`if got ${sourceInfo.count} giveaways from ${source}`, async () => {
      // Previous source needs to fail in order for it to fallback to a different one
      for (let j = 0; j < i; j++) mockFetch.mockResolvedValueOnce('NoBueno');

      const giv = new Giveaways();
      /** @type {import('discord.js').TextChannel} */
      const chan = giv.channel; // For type and eslint error

      // Waits till giveaways have been sent
      const wt = 200; // Wait Time in ms
      while (Date.now() - (chan.lastMessage?.createdTimestamp || 0) > wt) {
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, wt));
      }

      expect(chan.lastMessage.content).toBeDefined();
      expect(chan.messages.cache.size).toBe(sourceInfo.count);
    });
  });
});
