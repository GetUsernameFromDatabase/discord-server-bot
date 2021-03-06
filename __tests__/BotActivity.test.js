/* eslint-disable no-console */
import * as Discord from 'discord.js';
import BotActivity, {
  CreateActivity as CA,
} from '../src/client/BotActivity.js';
import { ID, client } from '../src/helpers/Identification.js';

jest.mock('node-fetch');
jest.useFakeTimers('modern');

ID.Server = new Discord.Guild(client);

const botAct = new BotActivity([
  CA(`help`, 1.5, 'WATCHING', true),
  CA('with my vodka bottle'),
  CA('๐๐ฒ๐ฝ๐ฑ ๐ฏ๐ต๐ธ๐๐ฎ๐ป๐ผ'),
  CA('สฤฑสษฅ ษนวษlฤฑสส'),
]);

test('activity count', () => {
  expect.assertions(1);
  console.log(botAct.activities);
  expect(botAct.activities).toBeDefined();
});
