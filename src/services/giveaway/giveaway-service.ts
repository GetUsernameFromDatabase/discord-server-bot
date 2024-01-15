import grabFreeGamesGiveawaySite from './site-fetchers/grab-free-games';
import grabFreeGamesSteamGiveawaySite from './site-fetchers/grab-free-games-steam.js';
import { TextBasedChannel } from 'discord.js';
import { BaseGiveawaySiteFetcher } from './site-fetchers/base';
import { Giveaway } from './giveaway';
import { GiveawayStatus, GiveawayStatusEnum } from './giveaway-status';
import { DB } from '@/database/database';
import { getChannelParentID } from '#lib/discord-fetch';
import { LogLevel } from '@sapphire/framework';

type TAvailableSite = 'GrabFreeGames' | 'GrabFreeGamesSteam';
type TSiteParsers = Record<TAvailableSite, BaseGiveawaySiteFetcher>;
const giveawayFetchers: TSiteParsers = {
  GrabFreeGames: grabFreeGamesGiveawaySite,
  GrabFreeGamesSteam: grabFreeGamesSteamGiveawaySite,
};

export class GiveawayService {
  giveaways: Giveaway[];
  latestStatus?: GiveawayStatus;

  /**
   * Please use `.initialize` if `initialGiveaways` not supplied
   * @param initialGiveaways **NB:** not a deep copy
   */
  constructor(initialGiveaways?: Giveaway[] | undefined) {
    this.giveaways = initialGiveaways || [];
  }

  // Make sure to put into base class if will ever make one
  protected get logHeader() {
    return `Service[${this.constructor.name}]`;
  }
  protected log(message: string, logLevel: LogLevel = LogLevel.Info) {
    const formattedMessage = `${this.logHeader}: ${message}`;
    globalThis.logger.write(logLevel, formattedMessage);
  }

  /**
   * Fetches giveaways if not supplied on construction
   */
  async initialize() {
    if (this.giveaways.length === 0) {
      const fetchResult = await this.fetchGiveaways();
      if (fetchResult instanceof GiveawayStatus) {
        this.latestStatus = fetchResult;
      } else {
        this.giveaways = fetchResult;
      }
    }
    return this;
  }

  /**
   *  Fetches giveaways from old to new
   *
   * **Note:** old to new is **not** guaranteed -- giveaways are just reversed\
   * it is assumed that website displays content from new to old
   */
  async fetchGiveaways() {
    this.latestStatus = undefined;
    const sources = Object.keys(giveawayFetchers);
    for (const sourceKey of sources) {
      const source = giveawayFetchers[sourceKey as TAvailableSite];
      const giveaways = await source
        .getGiveaways()
        .catch((error: Error) =>
          globalThis.logger.error(error, `${sourceKey}: FAILED`)
        );
      if (!giveaways || giveaways.length === 0) continue;

      // might be moved into giveawayFetcher
      this.giveaways = giveaways.reverse();
      for (const x of this.giveaways) x.storeIntoDatabase();

      this.log(`Fetched ${this.giveaways.length} giveaways from ${sourceKey}`);
      return this.giveaways;
    }
    return new GiveawayStatus(GiveawayStatusEnum.NONE_FOUND, true);
  }

  async filterGiveaways(channel: TextBasedChannel) {
    // might add a check for `this.latestStatus`
    const channelParent = getChannelParentID(channel);
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
                channelParent.id
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
    this.log(`Filtered ${Math.abs(delta)} giveaways for ${channelParent.id}`);
    // might be a good idea to initialize and then set NO_NEW status if delta 0
    return new GiveawayService(filteredGiveaways);
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

    const giveawayTitles = this.giveaways.map((x) => x.giveaway.title);
    const query = DB.replaceInto('giveaways_channel_link')
      .columns(['channel_container', 'giveaway_id'])
      .expression((eb) =>
        eb
          .selectFrom('giveaways')
          .select((eb) => [
            eb.val(channelParent.id).as('channel_container'),
            'giveaways.id',
          ])
          .where('giveaways.title', 'in', giveawayTitles)
      );
    await query.execute();

    this.latestStatus = new GiveawayStatus(GiveawayStatusEnum.SUCCESS);
    return this.latestStatus;
  }
}
