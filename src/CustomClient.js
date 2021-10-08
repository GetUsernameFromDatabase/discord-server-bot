import { Player } from 'discord-player';
import { Client, Collection } from 'discord.js';
import addEventsToPlayer from './PlayerEvents.js';

export default class DiscordBot extends Client {
  constructor(options) {
    super(options);
    this.commands = new Collection();
    this.handlers = new Collection();

    this.player = new Player(this, {
      leaveOnEnd: false,
      leaveOnEmptyCooldown: 30_000,
      ytdlOptions: {
        requestOptions: {
          headers: {
            cookie: process.env.YouTubeCookie,
          },
        },
      },
    });
    addEventsToPlayer(this.player);
  }
}
