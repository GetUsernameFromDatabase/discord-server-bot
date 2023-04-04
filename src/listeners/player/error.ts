import { container, Listener } from '@sapphire/framework';
import type { GuildQueue } from 'discord-player';

export class PlayerEvent extends Listener {
  public constructor(context: Listener.Context, options: Listener.Options) {
    super(context, {
      ...options,
      emitter: container.client.player.events,
      event: 'error',
    });
  }

  public run(queue: GuildQueue, error: Error) {
    globalThis.logger.warn(
      `[${queue.guild.name}] Error emitted from the queue: ${error.message}`
    );
  }
}
