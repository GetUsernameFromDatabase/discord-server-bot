import grabFreeGamesGiveawaySite from './site-fetchers/grab-free-games';
import grabFreeGamesSteamGiveawaySite from './site-fetchers/grab-free-games-steam';
import { TextBasedChannel } from 'discord.js';
import { BaseGiveawaySiteFetcher } from './site-fetchers/base';
import { Giveaway } from './giveaway';
import { GiveawayStatus, GiveawayStatusEnum } from './giveaway-status';
import { DB } from '@/database/database';
import { getChannelParentID } from '#lib/discord-fetch';
import { BaseService } from '../base-service';
import { memoryStore } from 'cache-manager';
import { CacheWrapper } from '@/utilities/cache-wrapper';

type TAvailableSite = 'GrabFreeGames' | 'GrabFreeGamesSteam';
type TSiteParsers = Record<TAvailableSite, BaseGiveawaySiteFetcher>;
const giveawayFetchers: TSiteParsers = {
  GrabFreeGames: grabFreeGamesGiveawaySite,
  GrabFreeGamesSteam: grabFreeGamesSteamGiveawaySite,
};

interface CacheMap {
  giveaways: Giveaway[];
}
const cache = new CacheWrapper<CacheMap>(memoryStore(), {
  max: 2,
  ttl: 900_000,
});

/**
 * Giveaway service for fetching, filtering, sending giveaways
 *
 * Will use cache on construction, to fetch
 */
export class GiveawayService extends BaseService {
  giveaways: Giveaway[];
  latestStatus?: GiveawayStatus;

  /**
   * Please use {@link GiveawayService.initialize} if {@link initialGiveaways} not supplied
   * @param initialGiveaways **NB:** not a deep copy
   */
  constructor(initialGiveaways?: Giveaway[] | undefined) {
    super();
    this.giveaways = initialGiveaways || [];
  }

  /**
   * Fetches giveaways if not supplied on construction
   */
  async initialize(): Promise<this> {
    if (this.giveaways.length > 0) return this;
    const cachedGiveaways = await cache.get('giveaways');
    if (cachedGiveaways) {
      this.giveaways = cachedGiveaways;
      return this;
    }

    // `this.fetchGiveaways()` already sets `this.giveaways`
    const fetchResult = await this.fetchGiveaways();
    if (!(fetchResult instanceof GiveawayStatus)) {
      void cache.set('giveaways', fetchResult);
    }
    return this;
  }

  /**
   *  Fetches giveaways from old to new
   * and stores to {@link GiveawayService.giveaways}
   *
   * **Note:** old to new is **not** guaranteed -- giveaways are just reversed\
   * it is assumed that website displays content from new to old
   */
  async fetchGiveaways() {
    this.latestStatus = undefined;
    const sources = Object.keys(giveawayFetchers);
    for (const sourceKey of sources) {
      const giveaways = await this.fetchGiveawaysFromSource(
        sourceKey as TAvailableSite
      );
      if (!giveaways) continue;

      this.giveaways = giveaways;
      return this.giveaways;
    }
    this.latestStatus = new GiveawayStatus(GiveawayStatusEnum.NONE_FOUND, true);
    return this.latestStatus;
  }

  /**
   *  Fetches giveaways from old to new
   *
   * **Note:** old to new is **not** guaranteed -- giveaways are just reversed\
   * it is assumed that website displays content from new to old
   */
  async fetchGiveawaysFromSource(sourceSite: TAvailableSite) {
    const source = giveawayFetchers[sourceSite];
    let giveaways = await source
      .getGiveaways()
      .catch((error: Error) =>
        globalThis.logger.error(error, `${sourceSite}: FAILED`)
      );
    if (!giveaways || giveaways.length === 0) return false;

    this.log(`Fetched ${giveaways.length} giveaways from ${sourceSite}`);
    giveaways = giveaways.reverse(); // to make it from `old to new`
    for (const x of giveaways) void x.storeIntoDatabase();
    return giveaways;
  }

  /**
   * @param channel_container connected to `giveaways_channel_link.channel_container` and {@link getChannelParentID}.id
   */
  async filterGiveaways(channel_container: string) {
    // might add a check for `this.latestStatus`
    const giveawayTitles = this.giveaways.map((x) => x.giveaway.title);

    const query = DB.selectFrom('giveaways')
      .select('giveaways.title')
      .where((x) =>
        x.and([
          x.eb('giveaways.title', 'in', giveawayTitles),
          x.eb('giveaways.id', 'in', (eb) =>
            eb
              .selectFrom('giveaways_channel_link')
              .select('giveaways_channel_link.giveaway_id')
              .where(
                'giveaways_channel_link.channel_container',
                '=',
                channel_container
              )
          ),
        ])
      );
    const sentGiveaways = await query.execute();

    const filteredGiveaways = this.giveaways.filter(
      (x) =>
        sentGiveaways.findIndex((pred) => pred.title === x.giveaway.title) ===
        -1
    );
    const delta = filteredGiveaways.length - this.giveaways.length;
    this.log(`Filtered ${Math.abs(delta)} giveaways for ${channel_container}`);
    // might be a good idea to initialize and then set NO_NEW status if delta 0
    return new GiveawayService(filteredGiveaways);
  }

  async filterGiveawaysWithChannel(channel: TextBasedChannel) {
    // might add a check for `this.latestStatus`
    const channelParent = getChannelParentID(channel);
    return this.filterGiveaways(channelParent.id);
  }

  /**
   * @param channel_container connected to `giveaways_channel_link.channel_container` and {@link getChannelParentID}.id
   */
  async storeSentGiveaways(channel_container: string) {
    const giveawayTitles = this.giveaways.map((x) => x.giveaway.title);
    const query = DB.replaceInto('giveaways_channel_link')
      .columns(['channel_container', 'giveaway_id'])
      .expression((eb) =>
        eb
          .selectFrom('giveaways')
          .select((eb) => [
            eb.val(channel_container).as('channel_container'),
            'giveaways.id',
          ])
          .where('giveaways.title', 'in', giveawayTitles)
      );
    await query.execute();
  }

  async sendGiveaways(channel: TextBasedChannel) {
    if (this.giveaways.length === 0) {
      this.latestStatus = new GiveawayStatus(GiveawayStatusEnum.NO_NEW);
      return this.latestStatus;
    }

    const channelParent = getChannelParentID(channel);
    for (const giveaway of this.giveaways) {
      await giveaway.sendToChannel(channel);
    }
    this.log(`Sent ${this.giveaways.length} giveaways to ${channelParent.id}`);
    await this.storeSentGiveaways(channelParent.id);

    this.latestStatus = new GiveawayStatus(GiveawayStatusEnum.SUCCESS);
    return this.latestStatus;
  }
}
