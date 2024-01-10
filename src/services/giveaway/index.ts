import grabFreeGamesGiveawaySite from './grab-free-games-giveaway-site';
import grabFreeGamesSteamGiveawaySite from './grab-free-games-steam-giveaway-site.js';
import type { BaseGiveawaySite } from './base-giveaway-site.js';
import { LogLevel } from '@sapphire/framework';

export interface TPostGiveawayOptions {
  /**
   * Whether to filter giveaways using local DB\
   * Default: `false`
   */
  noFilter: boolean;
  /**
   * Does not check previous messages when sending giveaways\
   * Default: `false`
   */
  ignorePreviousMessage: boolean;
}

type TAvailableSite = 'GrabFreeGames' | 'GrabFreeGamesSteam';
type TSiteParsers = Record<TAvailableSite, BaseGiveawaySite>;
const giveawayFetchers: TSiteParsers = {
  GrabFreeGames: grabFreeGamesGiveawaySite,
  GrabFreeGamesSteam: grabFreeGamesSteamGiveawaySite,
};

export enum GiveawayStatusEnum {
  SUCCESS = 'SUCCESS',
  NONE_FOUND = 'NONE_FOUND',
  NO_NEW = 'NO_NEW',
  FAILED_TO_SEND = 'FAILED_TO_SEND',
}
export type TGiveawayStatus = {
  log_message: string;
  log_level: LogLevel;
};
export type TGiveawayStatuses = Record<GiveawayStatusEnum, TGiveawayStatus>;
export const GiveawayStatuses: TGiveawayStatuses = {
  SUCCESS: {
    log_message: 'Giveaways successfully sent',
    log_level: LogLevel.Info,
  },
  NONE_FOUND: {
    log_message: 'No giveaways were found',
    log_level: LogLevel.Error,
  },
  NO_NEW: {
    log_message: 'No new giveaways',
    log_level: LogLevel.Info,
  },
  FAILED_TO_SEND: {
    log_message: 'Failed to send giveaways',
    log_level: LogLevel.Error,
  },
};

export function isGiveawayStatus(value: unknown): value is GiveawayStatusEnum {
  return typeof value === 'string' && value in GiveawayStatusEnum;
}

function logGiveawayFetchResult(giveawayStatus: GiveawayStatusEnum) {
  const { log_level, log_message } = GiveawayStatuses[giveawayStatus];
  if (log_level >= LogLevel.Error) {
    globalThis.logger.error(new Error(log_message));
  } else if (log_level >= LogLevel.Info) {
    globalThis.logger.info(log_message);
  }
  return giveawayStatus;
}

/**
 *  Gets giveaways from old to new
 *
 * **Note:** old to new is **not** guaranteed
 */
export async function GetGiveaways() {
  const sources = Object.keys(giveawayFetchers);
  for (const key of sources) {
    const source = giveawayFetchers[key as TAvailableSite];
    const giveaways = await source
      .getGiveaways()
      .catch((error: Error) =>
        globalThis.logger.error(error, `${key}: FAILED`)
      );

    if (!giveaways || giveaways.length === 0) continue;
    globalThis.logger.info(`Fetched ${giveaways.length} giveaways`);
    return giveaways.reverse();
  }
  return logGiveawayFetchResult(GiveawayStatusEnum.NONE_FOUND);
}
