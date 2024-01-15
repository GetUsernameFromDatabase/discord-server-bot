import { DB } from '@/database/database';
import { BaseCronJob } from './base';
import { Cron } from '@sapphire/time-utilities';
import { getTextBasedChannel } from '#lib/discord-fetch';
import { LogLevel, container } from '@sapphire/framework';
import { GiveawayService } from '@/services/giveaway/giveaway-service';

export class GiveawayNotifier extends BaseCronJob {
  static cron = new Cron('42 * * * *');
  async job() {
    const { client } = container;
    const query = DB.selectFrom('channel_purposes')
      .select(['channel_container', 'channel_id'])
      .where('channel_purpose', '=', 'givaways');
    const results = await query.execute();

    if (results.length === 0) {
      // no-one is subscribed to giveaways
      return;
    }
    const giveawayService = await new GiveawayService().initialize();
    if (giveawayService.latestStatus) {
      this.log(
        'No giveaways will be sent this time.' +
          `GiveawayService latest statusCode: "${giveawayService.latestStatus.statusCode}"`,
        LogLevel.Warn
      );
      return;
    }

    // maybe at some point turn it into Promise.all
    for (const record of results) {
      const channel = await getTextBasedChannel(record.channel_id);
      if (!channel) {
        client.logger.warn(
          `${this.constructor.name} ${record.channel_container} has invalid channel, deleting entry`
        );
        const query = DB.deleteFrom('channel_purposes')
          .where('channel_container', '=', record.channel_container)
          .where('channel_id', '=', record.channel_id);
        await query.execute();
        return;
      }

      const filteredService = await giveawayService.filterGiveaways(channel);
      await filteredService.sendGiveaways(channel);
    }
  }
}
