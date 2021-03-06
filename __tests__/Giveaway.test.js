import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs';
import { beforeAll, jest } from '@jest/globals';
import * as Discord from 'discord.js';
import * as jestExtended from 'jest-extended'; // Needed for types
import Giveaways, { givFile } from '../src/Giveaways.js';
import * as Messaging from '../src/client/Messaging.js';
import { prefix } from '../src/commands/Commands.js';
import givCmd from '../src/commands/giveaways/changeGivChan.js';
import { ID, client } from '../src/helpers/Identification.js';

jest.mock('node-fetch');
expect.extend(jestExtended);

ID.Server = new Discord.Guild(client);

givFile.location = './__tests__/res/FetchedGiveaways.json';
Giveaways.giveawaySites.GrabFreeGames.count = 13;
Giveaways.giveawaySites.steam.count = 5;

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

const WS = jest.requireActual('../src/services/WebScraping.js');
const axios = jest.requireActual('axios').default;

jest.spyOn(WS, 'SimpleFetch').mockImplementation(mockSimpleFetch);
/* Needed because /\ is not called inside WebScraping (parent) module
So this is used to replace the use of SimpleFetch inside WebScraping */
jest.spyOn(axios, 'get').mockImplementation(mockAxiosGet);
const SpyMassMessageSend = jest.spyOn(Messaging, 'MassMessageSend');

async function WaitTillNoNewMessages(chan) {
  /* eslint-disable no-promise-executor-return */
  const wt = 150; // Wait Time in ms
  await new Promise((r) => setTimeout(r, 75)); // Waits for spamming to start
  while (wt < Date.now() - (chan.lastMessage?.createdTimestamp || 0)) {
    // eslint-disable-next-line no-await-in-loop
    await new Promise((r) => setTimeout(r, wt));
  }
  return 'DONE WAITING';
  /* eslint-enable no-promise-executor-return */
}

function EmptyGiveawayJSON() {
  if (existsSync(givFile.location)) unlinkSync(givFile.location);
  else writeFileSync(givFile.location, '', givFile.encoding);
}

function GetServerChannels() {
  /** @type {Discord.TextChannel[]} */
  const channels = [...ID.Server.channels.cache.values()];
  return channels;
}

function FailSimpleFetch(count) {
  for (let i = 0; i < count; i++)
    mockSimpleFetch.mockRejectedValueOnce(
      `expect ${i === 0 ? 'no' : i} more failures for giveaways`
    );
  return count + 1;
}
// MOCK END

beforeAll(() => {
  EmptyGiveawayJSON();
});

afterAll(() => {
  // Closes open handles related to Client.setInterval
  client.destroy(); // only closes 1 for some weird reason
});

describe('giveaway fetches', () => {
  let fetchCounter = 0;
  /** @type {Discord.TextChannel} */
  let giveawayChannel;
  beforeEach(() => {
    // Clearing message collection before each was not robust enough
    giveawayChannel = new Discord.TextChannel(ID.Server);
    process.env.GiveawaysID = giveawayChannel.id;
    jest.useFakeTimers();
  });

  test.each(
    Object.entries(Giveaways.giveawaySites).map(([source, value]) => {
      return [value.count, source];
    })
  )('if got %i giveaways from %s', async (count) => {
    expect.assertions(2);
    // Previous source needs to fail in order for it to fallback to a different one
    fetchCounter = FailSimpleFetch(fetchCounter);
    const giveawayObject = new Giveaways();
    if (!client.handlers.has('giveaways'))
      client.handlers.set('giveaways', giveawayObject);
    jest.useRealTimers();

    await WaitTillNoNewMessages(giveawayChannel);
    expect(giveawayChannel.lastMessage.content).toBeDefined();
    expect(giveawayChannel.messages.cache.size).toBe(count);
  });

  test('false (fail) output of GetGiveaways', async () => {
    expect.assertions(1);
    const giveaways = new Giveaways();
    const lastChanKey = ID.Server.channels.cache.lastKey();
    const lastChan = ID.Server.channels.cache.get(lastChanKey);

    giveaways.ChangeChannel(lastChan.id);
    FailSimpleFetch(fetchCounter);
    const response = await giveaways.GetGiveaways();

    // This channel is purely for this test, so it will be deleted
    ID.Server.channels.cache.delete(lastChanKey);
    expect(response).toBeFalsy();
  });

  afterEach(() => {
    jest.useRealTimers();
  });
});

describe('giveaway interactions', () => {
  // Saves messages from all channels and then reverts back any changes made
  /** @type {Discord.Collection<string, Discord.Message>[]} */
  let messagesBefore;
  beforeAll(() => {
    messagesBefore = GetServerChannels().map((channel) =>
      channel.messages.cache.clone()
    );
  });
  afterEach(() => {
    const channels = GetServerChannels();
    for (let i = 0, n = messagesBefore.length; i < n; i++) {
      channels[i].messages.cache = messagesBefore[i];
    }
  });

  test.todo('test guildOnly parameter');

  it('should react properly to the channel command', async () => {
    expect.assertions(1);
    const lastChannel = GetServerChannels().pop();

    givCmd.execute(new Discord.Message(lastChannel, prefix + givCmd.name));
    await WaitTillNoNewMessages(lastChannel);

    const [[, first], [, last]] = Object.entries(Giveaways.giveawaySites);
    expect(lastChannel.messages.cache.size).toBe(first.count + last.count + 1);
  });

  it('should not send duplicates (Depending on MassMessageSend)', async () => {
    expect.assertions(2);
    const givChan = GetServerChannels().shift();
    // Disables JSON file check and changes the Giveaway channel to the first one
    client.handlers.get('giveaways').ChangeChannel(givChan.id);

    const amountBefore = givChan.messages.cache.size;
    SpyMassMessageSend.mockClear();
    await client.handlers.get('giveaways').GetGiveaways();

    expect(SpyMassMessageSend).toHaveBeenCalledTimes(1);
    expect(givChan.messages.cache.size).toBe(amountBefore);
  });

  it('should not send duplicates (Depending on the JSON file)', async () => {
    expect.assertions(2);
    await client.handlers.get('giveaways').GetGiveaways();
    const lastCall = SpyMassMessageSend.mock.calls.pop();

    // Undefined will be turned into true
    expect(lastCall[2]).toBeOneOf([undefined, true]);
    // No giveaways should get past JSON file check
    expect(lastCall[1]).toHaveLength(0);
  });
});
