import { Client, User, Guild } from 'discord.js';
import Logging from './Logging.js';

/** @type {{Giveaways: import('./Giveaways').default, BotActivity: import('./BotActivity').default}} */
export const handlers = {};

export const client = new Client();
export const ID = {
  Me: new User(client, {
    username: 'MiniGamer',
    discriminator: '4738',
    id: '186439588229677056',
    avatar: '24c90ae8f89d2b9989ba3cb4ff7e6eb1',
  }),
  Server: new Guild(undefined, { name: 'Placeholder guild' }),
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

  Server({ ServerID = process.env }) {
    return client.guilds
      .fetch(ServerID)
      .then((srv) => {
        ID.Server = srv;
      })
      .catch(Logging.Error);
  },
};
