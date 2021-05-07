const { BotActivity } = require('./BotActivity');
const { Giveaways } = require('./Giveaways');
const { Messaging } = require('./Messaging');
const { Identification, client } = require('./Identification');
const { Logging } = require('./Logging');
const { prefix } = require('./Commands');

client.login(process.env.TOKEN);

client.once('ready', async () => {
  // eslint-disable-next-line no-console
  await Identification.UpdateMyUser(); // Gets my up to date user data
  await Identification.UpdateServer(); // Gets my server
  Logging.Greet();

  // BOT FUNCTION INITIATIONS OR STARTING REQUIREMENTS
  /* eslint-disable no-new */
  new BotActivity();
  new Giveaways();
  /* eslint-enable no-new */
});

client.on('message', (msg) => {
  if (msg.content[0] === prefix) {
    Messaging.ReactToCommand(msg);
  }
});
