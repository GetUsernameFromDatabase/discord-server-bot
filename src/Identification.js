import { Player } from 'discord-player';
import { Client, User, Guild, Intents, Collection } from 'discord.js';
import Logging from './Logging.js';

export class DiscordBot extends Client {
  constructor(options) {
    super(options);
    this.commands = new Collection();
    this.handlers = new Collection();

    this.player = new Player(this);
    this.player.on('error', (queue, error) => {
      Logging.Log(
        `[${queue.guild.name}] Error emitted from the queue: ${error.message}`
      );
    });
    this.player.on('connectionError', (queue, error) => {
      Logging.Log(
        `[${queue.guild.name}] Error emitted from the connection: ${error.message}`
      );
    });
    this.player.on('trackStart', (queue, track) => {
      queue.metadata.send(
        `🎶 | Started playing: **${track.title}** in **${queue.connection.channel.name}**!`
      );
    });
    this.player.on('trackAdd', (queue, track) => {
      queue.metadata.send(`🎶 | Track **${track.title}** queued!`);
    });
    this.player.on('botDisconnect', (queue) => {
      queue.metadata.send(
        '❌ | I was manually disconnected from the voice channel, clearing queue!'
      );
    });
    this.player.on('channelEmpty', (queue) => {
      queue.metadata.send('❌ | Nobody is in the voice channel, leaving...');
    });
    this.player.on('queueEnd', (queue) => {
      queue.metadata.send('✅ | Queue finished!');
    });
  }
}

export const client = new DiscordBot({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_VOICE_STATES,
  ],
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
