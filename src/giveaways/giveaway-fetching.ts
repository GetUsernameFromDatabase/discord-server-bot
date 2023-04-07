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
import type { GiveawayObject, GiveawaySites } from '@/giveaways.js';
import { FetchedGiveawayStore } from '../store/giveaway-store.js';

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
  forceSend = false
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
      return PostGiveaways(channel, results, forceSend);
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
function FilterSentGiveaways(FetchedGiveaways: GiveawayObject[]) {
  const giveawayStore = new FetchedGiveawayStore();
  const storedData = giveawayStore.read() ?? [];

  const savedGiveaways = storedData.map(({ title }) => title.toLowerCase());
  const filteredGiveaways = [];
  for (const giv of FetchedGiveaways) {
    const { title, url } = giv;
    const index = savedGiveaways.indexOf(title.toLowerCase());
    const now = new Date().toISOString();

    if (index === -1) {
      filteredGiveaways.push(giv);
      storedData.push({ title, url, created_date: now, updated_date: now });
    } else {
      storedData[index].updated_date = now;
    }
  }
  return {
    filteredGiveaways,
    // Update store so latter can be run when sending giveaways was successful
    updateStore: () => giveawayStore.update(storedData),
  };
}

async function PostGiveaways(
  channel: TextBasedChannel,
  fetchedGiveaways: GiveawayObject[],
  forceSend = false
): Promise<keyof typeof GiveawayFetchMessages> {
  if (fetchedGiveaways.length === 0) return logFetchResult('NONE_FOUND');
  // Reversing this to make newer giveaways be sent last as the newest message
  const giveaways = fetchedGiveaways.reverse();
  const { filteredGiveaways, updateStore } =
    FilterSentGiveaways(fetchedGiveaways);

  let giveawaysToSend = filteredGiveaways;
  let type: 'JSON_FILTERED' | 'UNFILTERED' = 'JSON_FILTERED';
  if (forceSend) {
    giveawaysToSend = giveaways;
    type = 'UNFILTERED';
  }
  if (giveawaysToSend.length === 0) {
    return logFetchResult('NO_NEW');
  } else if (type === 'JSON_FILTERED') {
    globalThis.logger.info(`${giveawaysToSend.length} new giveaways to send`);
  }

  const giveawayMessages = giveawaysToSend.map((giv) => {
    const { body, ...rest } = giv;
    const embedBuilder = GetMessageEmbed(body, rest);
    return BuildMessageableEmbeds([embedBuilder]);
  });

  globalThis.logger.info(
    `Sending ${giveawayMessages.length} ${type} giveaways`
  );
  const sendSuccess = await MassMessageSend(channel, giveawayMessages, true);
  if (sendSuccess) {
    updateStore();
    return logFetchResult('SUCCESS');
  }
  return logFetchResult('FAILED_TO_SEND');
}
