import { Client, User, Guild } from 'discord.js';
import Logging from './Logging.js';

const client = new Client();
const ID = {
  Maintainer: new User(client, {
    username: 'MiniGamer',
    discriminator: '4738',
    id: '186439588229677056',
    avatar: '24c90ae8f89d2b9989ba3cb4ff7e6eb1',
  }),
  Server: new Guild(),
};

class Update {
  static Maintainer() {
    return client.users
      .fetch(ID.Maintainer.id)
      .then((usr) => {
        ID.Maintainer = usr;
      })
      .catch(Logging.Error);
  }

  static Server() {
    return client.guilds
      .fetch(process.env.ServerID)
      .then((srv) => {
        ID.Server = srv;
      })
      .catch(Logging.Error);
  }
}
export { Update, client, ID };
