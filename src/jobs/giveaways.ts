import { getTextBasedChannel } from '#lib/discord-fetch';
import { container } from '@sapphire/framework';
import { GetGiveaways } from '../giveaways/giveaway-fetching';
import { BaseCronJob } from './base';
import { Cron } from '@sapphire/time-utilities';

export class GiveawayNotifier extends BaseCronJob {
  static cron = new Cron('10 * * * *');
  async job() {
    const { client } = container;
    const store = client.sqlStores.GiveawayChannel;
    const records = await store.select('ALL');
    for (const [index, record] of records.entries()) {
      const channel = await getTextBasedChannel(record.channel);
      if (!channel) {
        client.logger.warn(
          `${record.type} ${record.parent_id} has invalid channel, deleting entry`
        );
        void store.delete(record);
        continue;
      }
      // Makes sure next requests are able to get cached version
      if (index === 0) await GetGiveaways(channel);
      else void GetGiveaways(channel);
    }
  }
}
