import { pathToFileURL, fileURLToPath } from 'url';
import { Collection } from 'discord.js';
import BotActivity from './BotActivity.js';
import { GetImportsFromFolders } from './DynamicImport.js';
import Giveaways from './Giveaways.js';
import { Update, client } from './Identification.js';
import Logging from './Logging.js';
import { LoadCommands } from './commands/Commands.js';

function LoadEvents() {
  const promises = GetImportsFromFolders(pathToFileURL('./src/events'));
  return Promise.all(promises).then((impPromises) => {
    for (const module of impPromises) {
      /** @type {import('./interfaces/events').EventObject} */
      const event = module.default;
      if (event.once)
        client.once(event.name, (...args) => event.execute(...args));
      else client.on(event.name, (...args) => event.execute(...args));
    }
  });
}

client.once('ready', async () => {
  await Update.Server(); // Gets my server
  await Update.Maintainer(); // Gets my up to date user data
  Logging.Greet(client);

  // TODO: Have cooldowns for commands
  client.cooldowns = new Collection();
  // BOT FUNCTION INITIATIONS OR STARTING REQUIREMENTS
  client.handlers.set('giveaways', new Giveaways());
  client.handlers.set('botActivity', new BotActivity());

  await LoadCommands();
  await LoadEvents();
});

client.on('disconnect', () => {
  Logging.Error('Bot has disconnected!');
});

client.on('error', Logging.Error);

if (process.argv[1] === fileURLToPath(import.meta.url))
  client.login(process.env.TOKEN);
