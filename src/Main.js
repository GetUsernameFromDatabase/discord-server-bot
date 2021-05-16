/* eslint-disable import/prefer-default-export */
import { pathToFileURL } from 'url';
import { Collection } from 'discord.js';
import Logging from './Logging.js';
import BotActivity from './BotActivity.js';
import Giveaways from './Giveaways.js';
import { Update, client } from './Identification.js';
import { LoadCommands } from './commands/Commands.js';
import { GetImportsFromFolders } from './DynamicImport.js';

/** @type {{Giveaways: Giveaways}} */
export const handlers = {};
function LoadEvents() {
  const promises = GetImportsFromFolders(pathToFileURL('./src/events'));
  return Promise.all(promises).then((impPromises) =>
    impPromises.forEach((module) => {
      /** @type {import('./interfaces/events').EventObject} */
      const event = module.default;
      if (event.once)
        client.once(event.name, (...args) => event.execute(...args));
      else client.on(event.name, (...args) => event.execute(...args));
    })
  );
}

client.login(process.env.TOKEN);

client.once('ready', async () => {
  await Update.Maintainer(); // Gets my up to date user data
  await Update.Server(); // Gets my server
  Logging.Greet(client);

  // BOT FUNCTION INITIATIONS OR STARTING REQUIREMENTS
  handlers.BotActivity = new BotActivity();
  handlers.Giveaways = new Giveaways();
  await LoadCommands();
  await LoadEvents();

  // TODO: Have cooldowns for commands
  client.cooldowns = new Collection();
});

client.on('disconnect', () => {
  Logging.Error('Bot has disconnected!');
});

client.on('error', Logging.Error);
