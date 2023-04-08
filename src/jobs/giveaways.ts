import { getTextBasedChannel } from '#lib/discord-fetch';
import { container } from '@sapphire/framework';
import { GetGiveaways } from '../giveaways/giveaway-fetching';
import { BaseCronJob } from './base';

export class GiveawayNotifier extends BaseCronJob {
  async job() {
    const { client } = container;
    for (const [key, channelID] of client.giveawayChannels.entries()) {
      const channel = await getTextBasedChannel(channelID);
      if (!channel) {
        client.logger.warn(`${key} has invalid channel, deleting entry`);
        client.giveawayChannels.delete(key);
        continue;
      }
      void GetGiveaways(channel);
    }
  }
}
