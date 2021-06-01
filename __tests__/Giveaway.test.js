import { readFileSync, writeFileSync } from 'fs';
import { beforeAll, jest } from '@jest/globals';
import * as Discord from 'discord.js';
import Giveaways from '../src/Giveaways.js';
import { ID, handlers, client } from '../src/Identification.js';
import { prefix } from '../src/commands/Commands.js';
import givCmd from '../src/commands/giveaways/changeGivChan.js';

Giveaways.jsonLoc = './__tests__/res/FetchedGiveaways.json';
Giveaways.giveawaySites.GrabFreeGames.count = 13;
Giveaways.giveawaySites.steam.count = 5;

client.user = Discord.botMock;
ID.Server = new Discord.Guild(client);

const mockSimpleFetch = jest.fn((URL) => {
  const GiveawaySites = Giveaways.giveawaySites;
  const resFolder = './__tests__/res/';

  let file;
  switch (URL) {
    case GiveawaySites.GrabFreeGames.url:
      file = `${resFolder}GrabFreeGames_response.txt`;
      break;
    case GiveawaySites.steam.url:
      file = `${resFolder}steam_response.txt`;
      break;

    default:
      return Promise.reject(
        new Error(`Couldn't find a matching file for URL:\n${URL}`)
      );
  }

  return Promise.resolve(readFileSync(file));
});
const mockAxiosGet = jest.fn(() => {
  const response = {
    data: '<p class="article-content">This is a fake pharagraph</p>',
  };
  return Promise.resolve(response);
});

const WS = jest.requireActual('../src/WebScraping.js');
const axios = jest.requireActual('axios').default;

jest.spyOn(WS, 'SimpleFetch').mockImplementation(mockSimpleFetch);
/* Needed because /\ is not called inside WebScraping (parent) module
So this is used to replace the use of SimpleFetch inside WebScraping */
jest.spyOn(axios, 'get').mockImplementation(mockAxiosGet);

async function WaitTillNoMessages(chan) {
  const wt = 150; // Wait Time in ms
  await new Promise((r) => setTimeout(r, 75)); // Waits for spamming to start
  while (wt < Date.now() - (chan.lastMessage?.createdTimestamp || 0)) {
    // eslint-disable-next-line no-await-in-loop
    await new Promise((r) => setTimeout(r, wt));
  }
  return Promise.resolve('DONE WAITING');
}

/** @type {[Discord.TextChannel, Giveaways][]]} */
let channels = [];

beforeAll(() => {
  writeFileSync(Giveaways.jsonLoc, '', 'utf8');
});

describe('giveaway fetches', () => {
  let fetchCounter = 0;
  beforeEach(() => {
    // Clearing message collection before each was not robust enough
    const channel = new Discord.TextChannel(ID.Server);
    channels.push(channel);

    // Previous source needs to fail in order for it to fallback to a different one
    for (let j = 0; j < fetchCounter; j++)
      mockSimpleFetch.mockRejectedValueOnce(`expect ${j} more failures`);
    fetchCounter++;
  });

  test.each(
    Object.entries(Giveaways.giveawaySites).map(([source, value]) => {
      return [value.count, source];
    })
  )('if got %i giveaways from %s', async (count) => {
    expect.assertions(2);
    const chan = channels[channels.length - 1];
    process.env.GiveawaysID = chan.id;

    const giv = new Giveaways();
    handlers.Giveaways ??= giv; // Used in the "interaction" test

    await WaitTillNoMessages(chan);
    expect(chan.lastMessage.content).toBeDefined();
    expect(chan.messages.cache.size).toBe(count);
  });
});

describe('interaction', () => {
  const channelsCopy = channels;
  beforeEach(() => {
    channels = channelsCopy;
  });
  test.todo('test guildOnly parameter');
  it('should send correct amount of giveaways after receiving a command', async () => {
    expect.assertions(1);
    const lastChannel = channels[channels.length - 1];

    givCmd.execute(new Discord.Message(lastChannel, prefix + givCmd.name));
    await WaitTillNoMessages(lastChannel);

    const [[, first], [, last]] = Object.entries(Giveaways.giveawaySites);
    expect(lastChannel.messages.cache.size).toBe(first.count + last.count + 1);
  });
  it.skip('should not send duplicates', async () => {
    expect.assertions(1);
    await new Promise((r) => setTimeout(r, 500));
    const { channel } = handlers.Giveaways;
    const amountBefore = channel.messages.cache.size;

    handlers.Giveaways.GetGiveaways();
    await WaitTillNoMessages(channel);
    // Currently not working cause of the current mocked Messaging system
    expect(amountBefore).toBe(channel.messages.cache.size);
  });
});
