import Logging from './Logging.js';
import BotActivity from './BotActivity.js';
import Giveaways from './Giveaways.js';
import { ReactToCommand } from './Messaging.js';
import { Update, client } from './Identification.js';
import { prefix } from './Commands.js';

client.login(process.env.TOKEN);

client.once('ready', async () => {
  // eslint-disable-next-line no-console
  await Update.Maintainer(); // Gets my up to date user data
  await Update.Server(); // Gets my server
  Logging.Greet(client);

  // BOT FUNCTION INITIATIONS OR STARTING REQUIREMENTS
  /* eslint-disable no-new */
  new BotActivity();
  new Giveaways();
  /* eslint-enable no-new */
});

client.on('message', (msg) => {
  if (msg.content[0] === prefix) {
    ReactToCommand(msg);
  }
});

client.on('disconnect', () => {
  Logging.Error('Bot has disconnected!');
});

client.on('error', Logging.Error);
