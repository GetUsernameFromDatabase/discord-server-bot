/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { container, Listener } from '@sapphire/framework';
import type { GuildQueue, Track } from 'discord-player';
import type { GuildTextBasedChannel } from 'discord.js';

export class PlayerEvent extends Listener {
  public constructor(context: Listener.Context, options: Listener.Options) {
    super(context, {
      ...options,
      emitter: container.client.player.events,
      event: 'playerStart',
    });
  }

  public run(
    queue: GuildQueue<{ channel: GuildTextBasedChannel }>,
    track: Track
  ) {
    const { voice } = container.client.utils;
    const permissions = voice(queue.metadata.channel);
    if (permissions.events) return;

    return queue.metadata.channel
      .send(`💿 | Now playing: **${track.title || 'Unknown Title'}**`)
      .then((m: { delete: () => void }) => setTimeout(() => m.delete(), 5000));
  }
}
