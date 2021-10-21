import { Player } from 'discord-player';
import { Client, Collection } from 'discord.js';
import addEventsToPlayer from './PlayerEvents.js';

export default class DiscordBot extends Client {
  constructor(options) {
    super(options);
    this.commands = new Collection();
    this.handlers = new Collection();

    this.player = new Player(this, {
      leaveOnEnd: false, // Leaving manually on end - with cooldown
      leaveOnEmptyCooldown: 60_000,
      ytdlOptions: {
        requestOptions: {
          headers: {
            cookie: process.env.YouTubeCookie,
          },
          filter: 'audioonly',
          quality: 'highestaudio',
          highWaterMark: 32 * 1024 * 1024,
          dlChunkSize: 0,
          maxReconnects: 3,
          liveBuffer: 4000,
        },
      },
    });
    addEventsToPlayer(this.player);
  }
}
