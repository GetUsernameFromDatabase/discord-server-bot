import { existsSync, readFileSync, writeFileSync } from 'node:fs';
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
import type { TextChannel } from 'discord.js';
import type {
  GiveawayFileDescriptor,
  GiveawayObject,
  GiveawayObjectJSON,
  GiveawaySites,
} from '@/giveaways.js';
import { envParseBoolean, envParseString } from '@skyra/env-utilities';
import type { CustomClient } from '../custom-client';
import { Time } from '@sapphire/time-utilities';

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
    globalThis.logger.error(new Error(logMessage));
  } else {
    globalThis.logger.info(logMessage);
  }
  return result;
}

export default class Giveaways {
  client: CustomClient;
  channelChanged = false;

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

  private channel!: TextChannel;

  constructor(client: CustomClient) {
    this.client = client;
    void this.initiate();
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    setInterval(this.GetGiveaways.bind(this), 60 * Time.Minute);
  }

  async getChannelFromMainGuild(ChannelID: string) {
    const guild = this.client.guilds.cache.at(0);
    if (!guild)
      throw new Error('Discord Client needs to be at least in one server');
    const channel = await guild.channels.fetch(ChannelID);
    if (!channel) throw new Error('This channel does not exist');
    return channel as TextChannel;
  }

  /**
   * Since I can't use await in the constructor
   */
  async initiate() {
    const channelID = envParseBoolean('DEV')
      ? envParseString('TEST_CHANNEL_ID')
      : envParseString('GIVEAWAYS_CHANNEL_ID');
    this.channel = await this.getChannelFromMainGuild(channelID);
    void this.GetGiveaways();
  }

  /**
   * Used to change channel and notify if giveaways should be filtered by json
   */
  async ChangeChannel(ChannelID: string) {
    this.channelChanged = this.channel.id !== ChannelID;
    if (this.channelChanged) {
      this.channel = await this.getChannelFromMainGuild(ChannelID);
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
        .catch((error) =>
          globalThis.logger.error(error as Error, `${key}: FAILED`)
        );

      if (results && results.length > 0) {
        globalThis.logger.info(`Fetched ${results.length} giveaways`);
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
