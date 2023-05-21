import {
  BuildMessageableEmbeds,
  GetMessageEmbed,
  MassMessageSend,
} from '../helpers/messaging.js';
import {
  GrabFreeGames,
  GetSteamAnnouncements,
  SimpleFetch,
} from '../helpers/web-scraping.js';
import type { TextBasedChannel } from 'discord.js';
import type {
  GiveawayObject,
  GiveawaySites,
  PostGiveawayOptions,
} from '@/giveaways.js';
import { stores } from '../store/index.js';

const SiteFetchers: GiveawaySites = {
  GrabFreeGames: {
    url: 'https://grabfreegames.com/free',
    parse: GrabFreeGames,
  },
  steam: {
    url: 'https://steamcommunity.com/groups/GrabFreeGames/announcements/listing?',
    parse: GetSteamAnnouncements,
  },
};

export const GiveawayFetchMessages = {
  SUCCESS: 'Giveaways successfully sent',
  NONE_FOUND: 'No giveaways were found',
  NO_NEW: 'No new giveaways',
  FAILED_TO_SEND: 'Failed to send giveaways',
};

export async function GetGiveaways(
  channel: TextBasedChannel,
  options?: Partial<PostGiveawayOptions>
): Promise<keyof typeof GiveawayFetchMessages> {
  const sources = Object.keys(SiteFetchers);
  for (const key of sources) {
    const source = SiteFetchers[key];
    // eslint-disable-next-line no-await-in-loop
    const results = await SimpleFetch<string>(source.url)
      .then((value) => source.parse(value))
      .catch((error) =>
        globalThis.logger.error(error as Error, `${key}: FAILED`)
      );

    if (results && results.length > 0) {
      globalThis.logger.info(`Fetched ${results.length} giveaways`);
      return PostGiveaways(channel, results, options);
    }
  }
  return logFetchResult('NONE_FOUND');
}

function logFetchResult(result: keyof typeof GiveawayFetchMessages) {
  const logMessage = GiveawayFetchMessages[result];
  if (result === 'FAILED_TO_SEND' || result === 'NONE_FOUND') {
    globalThis.logger.error(new Error(logMessage));
  } else {
    globalThis.logger.info(logMessage);
  }
  return result;
}

/** Filters out sent giveaways from fetched giveaways */
async function FilterSentGiveaways(
  channel: TextBasedChannel,
  FetchedGiveaways: GiveawayObject[]
) {
  const store = stores.FetchedGiveaways;
  const fetchHistory = await store.selectWithChannel(channel, ['title', 'url']);
  if (!fetchHistory) return;

  const staleGiveaways: GiveawayObject[] = [];
  const freshGiveaways = FetchedGiveaways.filter((x) => {
    const { title, url } = x;
    if (fetchHistory.includes({ title, url })) {
      staleGiveaways.push(x);
      return false;
    }
    return true;
  });
  return { fresh: freshGiveaways, stale: staleGiveaways };
}

async function PostGiveaways(
  channel: TextBasedChannel,
  fetchedGiveaways: GiveawayObject[],
  inputOptions?: Partial<PostGiveawayOptions>
): Promise<keyof typeof GiveawayFetchMessages> {
  if (fetchedGiveaways.length === 0) return logFetchResult('NONE_FOUND');
  const options: PostGiveawayOptions = {
    noFilter: false,
    ignorePreviousMessage: false,
    ...inputOptions,
  };

  // Reversing this to make newer giveaways be sent last as the newest message
  let giveaways = fetchedGiveaways.reverse();
  const filteredGiveaways = options.noFilter
    ? undefined
    : await FilterSentGiveaways(channel, giveaways);
  if (filteredGiveaways) {
    giveaways = filteredGiveaways.fresh;
  }

  if (giveaways.length === 0) {
    return logFetchResult('NO_NEW');
  }
  globalThis.logger.info(`Sendable giveaway amount: ${giveaways.length}`);

  const giveawayMessages = giveaways.map((giv) => {
    const { body, ...rest } = giv;
    const embedBuilder = GetMessageEmbed(body, rest);
    return BuildMessageableEmbeds([embedBuilder]);
  });

  const sendSuccess = await MassMessageSend(
    channel,
    giveawayMessages,
    !options.ignorePreviousMessage
  );
  if (sendSuccess) {
    const store = stores.FetchedGiveaways;
    await store.saveSentGiveaways(channel, giveaways);
    return logFetchResult('SUCCESS');
  }
  return logFetchResult('FAILED_TO_SEND');
}
