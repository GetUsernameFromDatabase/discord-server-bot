import * as Discord from 'discord.js';
import BotActivity, {
  CreateActivity as CA,
} from '../src/client/bot-activity.js';
import { ID, client } from '../src/helpers/identification.js';

jest.mock('node-fetch');
jest.useFakeTimers();

ID.Server = Reflect.construct(Discord.Guild, [client]) as Discord.Guild;

const botAct = new BotActivity([
  CA('with my vodka bottle'),
  CA('𝔀𝓲𝓽𝓱 𝓯𝓵𝓸𝔀𝓮𝓻𝓼'),
  CA('ʍıʇɥ ɹǝɐlıʇʎ'),
]);

test('activity count', () => {
  expect.assertions(1);
  console.log(botAct.activities);
  expect(botAct.activities).toBeDefined();
});
