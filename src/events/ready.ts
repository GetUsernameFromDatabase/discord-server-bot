import { DiscordBotEvent } from '@/events.js';
import BotActivity, { CreateActivity as CA } from '../client/bot-activity.js';
import { HandlerKeys } from '../client/custom-client.js';
import Giveaways from '../giveaways.js';
import { client, Update } from '../helpers/identification.js';
import logging from '../logging.js';

export default {
  listener: 'once',
  event: 'ready',
  execute: async () => {
    await Update.Server(); // Gets my server
    await Update.Maintainer(); // Gets my up to date user data
    logging.Greet(client);

    // BOT FUNCTION INITIATIONS OR STARTING REQUIREMENTS
    client.handlers.set(HandlerKeys.Giveaways, new Giveaways());
    client.handlers.set(
      HandlerKeys.BotActivity,
      new BotActivity([
        CA('with my vodka bottle'),
        CA('𝔀𝓲𝓽𝓱 𝓯𝓵𝓸𝔀𝓮𝓻𝓼'),
        CA('ʍıʇɥ ɹǝɐlıʇʎ'),
      ])
    );
  },
} as DiscordBotEvent;
