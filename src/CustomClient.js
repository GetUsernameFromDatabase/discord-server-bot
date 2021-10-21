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
      bufferingTimeout: 4200,
      ytdlOptions: {
        requestOptions: {
          headers: {
            cookie: process.env.YouTubeCookie,
          },
          quality: 'highestaudio',
          // eslint-disable-next-line no-bitwise
          highWaterMark: 1 << 25,
          filter: 'audioonly',
          dlChunkSize: 0,
          maxReconnects: 2,
        },
      },
    });
    addEventsToPlayer(this.player);
  }
}
