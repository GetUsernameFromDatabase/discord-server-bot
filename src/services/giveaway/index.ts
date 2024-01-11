import grabFreeGamesGiveawaySite from './site-fetchers/grab-free-games';
import grabFreeGamesSteamGiveawaySite from './site-fetchers/grab-free-games-steam.js';
import { TextBasedChannel } from 'discord.js';
import { BaseGiveawaySiteFetcher } from './site-fetchers/base';
import { Giveaway } from './giveaway';
import { GiveawayStatus, GiveawayStatusEnum } from './giveaway-status';

type TAvailableSite = 'GrabFreeGames' | 'GrabFreeGamesSteam';
type TSiteParsers = Record<TAvailableSite, BaseGiveawaySiteFetcher>;
const giveawayFetchers: TSiteParsers = {
  GrabFreeGames: grabFreeGamesGiveawaySite,
  GrabFreeGamesSteam: grabFreeGamesSteamGiveawaySite,
};

/**
 *  Gets giveaways from old to new
 *
 * **Note:** old to new is **not** guaranteed -- giveaways are just reversed\
 * it is assumed that website displays content from new to old
 */
export async function GetGiveaways() {
  // TODO: add filter for sent giveaways
  const sources = Object.keys(giveawayFetchers);
  for (const key of sources) {
    const source = giveawayFetchers[key as TAvailableSite];
    let giveaways = await source
      .getGiveaways()
      .catch((error: Error) =>
        globalThis.logger.error(error, `${key}: FAILED`)
      );

    if (!giveaways || giveaways.length === 0) continue;
    globalThis.logger.info(`Fetched ${giveaways.length} giveaways`);
    giveaways = giveaways.reverse();
    return Giveaway.convertGiveawayObjects(giveaways);
  }
  return new GiveawayStatus(GiveawayStatusEnum.NONE_FOUND, true);
}

export async function SendGiveawaysToChannel(
  channel: TextBasedChannel,
  giveaways: Giveaway[]
) {
  for (const giveaway of giveaways) {
    await giveaway.sendToChannel(channel);
  }
}

export async function FetchAndSendGiveaways(channel: TextBasedChannel) {
  const giveaways = await GetGiveaways();
  if (giveaways instanceof GiveawayStatus) {
    return giveaways;
  }

  await SendGiveawaysToChannel(channel, giveaways);
  return new GiveawayStatus(GiveawayStatusEnum.SUCCESS);
}
