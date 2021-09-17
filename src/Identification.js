import { Client, User, Guild, Intents, Collection } from 'discord.js';
import Logging from './Logging.js';

class DiscordBot extends Client {
  constructor(options) {
    super(options);
    this.commands = new Collection();
    this.handlers = new Collection();
  }
}

export const client = new DiscordBot({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});
export const ID = {
  Me: new User(client, {
    username: 'MiniGamer',
    discriminator: '4738',
    id: '186439588229677056',
    avatar: '24c90ae8f89d2b9989ba3cb4ff7e6eb1',
  }),
  Server: new Guild(
    new Client({
      intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
    }),
    { name: 'Placeholder guild' }
  ),
};

export const Update = {
  Maintainer() {
    return client.users
      .fetch(ID.Me.id)
      .then((usr) => {
        ID.Me = usr;
      })
      .catch(Logging.Error);
  },

  Server(ServerID = process.env.ServerID) {
    return client.guilds
      .fetch(ServerID)
      .then((srv) => {
        ID.Server = srv;
      })
      .catch(Logging.Error);
  },
};
