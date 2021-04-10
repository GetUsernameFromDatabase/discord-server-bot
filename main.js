require('dotenv').config();
const {
  BotActivity
} = require('./BotActivity');
const {
  Giveaways
} = require('./Giveaways');
const {
  Messaging
} = require('./Messaging');
const {
  Identification,
  client
} = require('./Identification');
const { prefix } = require('./Commands');

function EngineStart() {
  Identification.Server = client.guilds.cache.get(process.env.ServerID);
  // Gets the live version of my user
  client.users.fetch(Identification.MyUser.id)
    .then(x => { Identification.MyUser = x; })
    .catch(error => {
      // eslint-disable-next-line no-console
      console.error(error);
    });

  /* eslint-disable no-new */
  // Starts the bot activity
  new BotActivity();
  // Initiates giveaway functions
  new Giveaways();
}

client.once('ready', () => {
  // eslint-disable-next-line no-console
  console.log(`Logged in as ${client.user.tag}!`);

  // BOT FUNCTION INITIATIONS OR STARTING REQUIREMENTS
  EngineStart();
});

client.on('message', msg => {
  if (msg.content[0] === prefix) {
    Messaging.ReactToCommand(msg);
  }
});

client.login(process.env.TOKEN);
