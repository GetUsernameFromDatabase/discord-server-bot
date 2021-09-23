import { Player } from 'discord-player';
import { Client, Collection } from 'discord.js';
import Logging from './Logging.js';

export default class DiscordBot extends Client {
  constructor(options) {
    super(options);
    this.commands = new Collection();
    this.handlers = new Collection();

    this.player = new Player(this, { leaveOnEmptyCooldown: 30 * 1000 });
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
    this.player.on('botDisconnect', (queue) => {
      queue.metadata.send(
        '❌ | I was manually disconnected from the voice channel, clearing queue!'
      );
    });

    this.player.on('trackAdd', (queue, track) => {
      queue.metadata.send(`🎶 | Track **${track.title}** queued!`);
    });
    this.player.on('tracksAdd', (queue, tracks) => {
      queue.metadata.send(`🎶 | ${tracks.length} tracks added to the queue!`);
    });

    this.player.on('channelEmpty', (queue) => {
      queue.metadata.send('❌ | Nobody is in the voice channel, leaving...');
    });
    this.player.on('queueEnd', (queue) => {
      queue.metadata.send('✅ | Queue finished!');
    });
  }
}
