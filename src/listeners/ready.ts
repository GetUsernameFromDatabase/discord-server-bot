import { Listener } from '@sapphire/framework';
import type { CustomClient } from '../custom-client';

export class UserEvent extends Listener {
  public constructor(context: Listener.Context, options: Listener.Options) {
    super(context, {
      ...options,
      once: true,
    });
  }

  public async run() {
    const client = this.container.client as CustomClient;
    client.logger.info(
      `Successfully logged in as: ${
        this.container.client.user?.username ?? 'NO_ONE'
      }`
    );

    await client.onReady();
  }
}
