const { BotActivity } = require("./BotActivity");
const { Giveaways } = require("./Giveaways");
const { Messaging } = require("./Messaging");
const { Identification, client } = require("./Identification");
const { prefix } = require("./Commands");

client.login(process.env.TOKEN);

client.once("ready", async () => {
  // eslint-disable-next-line no-console
  console.log(`Logged in as ${client.user.tag}!`);
  // Gets my up to date user data
  await client.users
    .fetch(Identification.MyUser.id)
    .then((usr) => {
      Identification.MyUser = usr;
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error(err);
    });
  // Gets my server
  await client.guilds
    .fetch(process.env.ServerID)
    .then((srv) => {
      Identification.Server = srv;
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error(err);
    });

  // BOT FUNCTION INITIATIONS OR STARTING REQUIREMENTS
  /* eslint-disable no-new */
  new BotActivity(client);
  new Giveaways();
  /* eslint-enable no-new */
});

client.on("message", (msg) => {
  if (msg.content[0] === prefix) {
    Messaging.ReactToCommand(msg);
  }
});
