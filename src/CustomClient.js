import { Player } from 'discord-player';
import { Client, Collection } from 'discord.js';
import Logging from './Logging.js';

/**
 * @param {import('discord-player').Queue} queue */
function manualLeaveOnEmpty(queue) {
  if (queue.playing) return;
  queue.destroy();
  Logging.Log('Left manually on empty :(');
}

/**
 * @param {Player} player */
function addEventsToPlayer(player) {
  player.on('error', (queue, error) => {
    Logging.Log(
      `[${queue.guild.name}] Error emitted from the queue: ${error.message}`
    );
  });
  player.on('connectionError', (queue, error) => {
    Logging.Log(
      `[${queue.guild.name}] Error emitted from the connection: ${error.message}`
    );
  });
  player.on('botDisconnect', (queue) => {
    queue.metadata.send(
      '❌ | I was manually disconnected from the voice channel, clearing queue!'
    );
  });

  player.on('trackAdd', (queue, track) => {
    queue.metadata.send(`🎶 | Track **${track.title}** queued!`);
  });
  player.on('tracksAdd', (queue, tracks) => {
    queue.metadata.send(`🎶 | ${tracks.length} tracks added to the queue!`);
  });

  player.on('channelEmpty', (queue) => {
    queue.metadata.send('❌ | Nobody is in the voice channel, leaving...');
  });
  player.on('queueEnd', (queue) => {
    queue.metadata.send('✅ | Queue finished!');
    setTimeout(() => {
      manualLeaveOnEmpty(queue);
    }, queue.options.leaveOnEmptyCooldown + 1000 || 1000);
  });
}

export default class DiscordBot extends Client {
  constructor(options) {
    super(options);
    this.commands = new Collection();
    this.handlers = new Collection();

    this.player = new Player(this, {
      leaveOnEnd: false,
      leaveOnEmptyCooldown: 30_000,
    });
    addEventsToPlayer(this.player);
  }
}
