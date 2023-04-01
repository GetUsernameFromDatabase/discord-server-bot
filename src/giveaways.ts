import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import Logging, { minInMs } from './logging.js';
import {
  ConvertEmbedToMessage,
  GetMessageEmbed,
  MassMessageSend,
} from './client/messaging.js';
import { ID } from './helpers/identification.js';
import {
  GrabFreeGames,
  GetSteamAnnouncements,
  SimpleFetch,
} from './helpers/web-scraping.js';
import { TextChannel } from 'discord.js';
import {
  GiveawayFileDescriptor,
  GiveawayObject,
  GiveawayObjectJSON,
  GiveawaySites,
} from '@/giveaways.js';

export const givFile: GiveawayFileDescriptor = {
  location: './data/FetchedGiveaways.json',
  encoding: 'utf8',
};

export const GiveawayFetchMessages = {
  SUCCESS: 'Giveaways successfully sent',
  NONE_FOUND: 'No giveaways were found',
  NO_NEW: 'No new giveaways',
  FAILED_TO_SEND: 'Failed to send giveaways',
};

function logFetchResult(result: keyof typeof GiveawayFetchMessages) {
  const logMessage = GiveawayFetchMessages[result];
  if (result === 'FAILED_TO_SEND' || result === 'NONE_FOUND') {
    Logging.Error(new Error(logMessage));
  } else {
    Logging.Log(logMessage);
  }
  return result;
}

export default class Giveaways {
  private channel!: TextChannel;

  static giveawaySites: GiveawaySites = {
    GrabFreeGames: {
      url: 'https://grabfreegames.com/free',
      callback: GrabFreeGames,
    },
    steam: {
      url: 'https://steamcommunity.com/groups/GrabFreeGames/announcements/listing?',
      callback: GetSteamAnnouncements,
    },
  };
  channelChanged = false;

  constructor() {
    const channelID = process.env.DEV
      ? process.env.TEST_CHANNEL_ID
      : process.env.GIVEAWAYS_CHANNEL_ID;
    void this.ChangeChannel(channelID).then(() => this.GetGiveaways());
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    setInterval(this.GetGiveaways.bind(this), 60 * minInMs);
  }

  async ChangeChannel(ChannelID: string) {
    // TODO: Make the change be saved (maybe save the channel ID in .env)
    if (this.channel && this.channel.id !== ChannelID) {
      this.channelChanged = true;
      this.channel = (await ID.Server.channels.fetch(ChannelID)) as TextChannel;
    } else if (!this.channel) {
      this.channel = (await ID.Server.channels.fetch(ChannelID)) as TextChannel;
    }
    return this.channelChanged;
  }

  async GetGiveaways(
    forceSend = false
  ): Promise<keyof typeof GiveawayFetchMessages> {
    const sources = Object.keys(Giveaways.giveawaySites);
    for (const key of sources) {
      const source = Giveaways.giveawaySites[key];
      // eslint-disable-next-line no-await-in-loop
      const results = await SimpleFetch<string>(source.url)
        .then((value) => source.callback(value))
        .catch((error) => Logging.Error(error as Error, `${key}: FAILED`));

      if (results && results.length > 0) {
        Logging.Log(`Fetched ${results.length} giveaways`);
        return this.PostGiveaways(results, forceSend);
      }
    }
    return logFetchResult('NONE_FOUND');
  }

  /** Filters out sent giveaways from fetched giveaways */
  static FilterSentGiveaways(FetchedGiveaways: GiveawayObject[]) {
    let FileJSON = '[]';
    if (existsSync(givFile.location))
      FileJSON = readFileSync(givFile.location, givFile.encoding);

    const data = JSON.parse(FileJSON) as GiveawayObjectJSON[];
    const savedGiveaways = data.map(({ title }) => title.toLowerCase());

    const filteredGiveaways = [];
    const jsonUpdate = data; // dataUpdate is a pointer to data
    for (const giv of FetchedGiveaways) {
      const { title, url } = giv;
      const index = savedGiveaways.indexOf(title.toLowerCase());
      const now = new Date().toISOString();

      if (index === -1) {
        filteredGiveaways.push(giv);
        jsonUpdate.push({ title, url, created_date: now, updated_date: now });
      } else {
        jsonUpdate[index].updated_date = now;
      }
    }
    return { filteredGiveaways, jsonUpdate };
  }

  private static UpdateGiveawayJSONFile(JSONObject: GiveawayObjectJSON[]) {
    writeFileSync(
      givFile.location,
      JSON.stringify(JSONObject, undefined, 2),
      givFile.encoding
    );
  }

  private async PostGiveaways(
    FetchedGiveaways: GiveawayObject[],
    forceSend = false
  ): Promise<keyof typeof GiveawayFetchMessages> {
    if (FetchedGiveaways.length === 0) return logFetchResult('NONE_FOUND');
    // Reversing this to make newer giveaways be sent last as the newest message
    const giveaways = FetchedGiveaways.reverse();
    const { filteredGiveaways, jsonUpdate } =
      Giveaways.FilterSentGiveaways(FetchedGiveaways);

    let giveawaysToSend = filteredGiveaways;
    let type: 'JSON_FILTERED' | 'UNFILTERED' = 'JSON_FILTERED';
    if (forceSend || this.channelChanged) {
      giveawaysToSend = giveaways;
      type = 'UNFILTERED';
    }
    if (giveawaysToSend.length === 0) {
      return logFetchResult('NO_NEW');
    } else if (type === 'JSON_FILTERED') {
      Logging.Log(`${giveawaysToSend.length} new giveaways to send`);
    }

    const giveawayMessages = giveawaysToSend.map((giv) => {
      const { body, ...rest } = giv;
      return ConvertEmbedToMessage(GetMessageEmbed(body, rest));
    });

    Logging.Log(`Sending ${giveawayMessages.length} ${type} giveaways `);
    const sendSuccess = await MassMessageSend(
      this.channel,
      giveawayMessages,
      true
    );
    if (sendSuccess) {
      Giveaways.UpdateGiveawayJSONFile(jsonUpdate);
      this.channelChanged = false;
      return logFetchResult('SUCCESS');
    }
    return logFetchResult('FAILED_TO_SEND');
  }
}
