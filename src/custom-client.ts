import './utilities/setup';
import {
  BucketScope,
  LogLevel,
  SapphireClient,
  type ILogger,
} from '@sapphire/framework';
import { envParseArray } from '@skyra/env-utilities';
import BotActivity, { CreateActivity as CA } from './bot-activity';
import { Player } from 'discord-player';
import { GatewayIntentBits, User } from 'discord.js';
import * as Utils from './utilities/auricle-utils';
import { StartJobs } from './jobs';

interface CustomProperties {
  readonly player: Player;
  readonly utils: typeof Utils;
  readonly botActivity: BotActivity; // this will come on ready
  readonly maintainer: User;
}

declare module 'discord.js' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Client extends CustomProperties {}
}

/* eslint-disable no-var */
declare global {
  var logger: ILogger;
}

async function setMaintainer(client: CustomClient) {
  const mainOwner = envParseArray('OWNERS')[0];
  const { logger } = globalThis;

  try {
    const maintainer = await client.users.fetch(mainOwner);
    const { username, discriminator } = maintainer;

    client.maintainer = maintainer;
    logger.info(`Maintainer changed to ${username}#${discriminator}`);
  } catch (error) {
    return logger.error(error);
  }
}

export class CustomClient extends SapphireClient implements CustomProperties {
  player;
  utils;
  botActivity!: BotActivity; // onReady
  maintainer!: User; // onReady

  constructor() {
    super({
      disableMentionPrefix: true,
      intents: [
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
      ],
      defaultCooldown: {
        filteredUsers: envParseArray('OWNERS'),
        scope: BucketScope.User,
        delay: 10_000,
        limit: 2,
      },
      logger: {
        level: LogLevel.Debug,
      },
    });
    globalThis.logger = this.logger;

    this.utils = Utils;
    this.player = Player.singleton(this);
  }

  public async onReady() {
    await setMaintainer(this);
    this.botActivity = new BotActivity(this, [
      CA('with my vodka bottle'),
      CA('𝔀𝓲𝓽𝓱 𝓯𝓵𝓸𝔀𝓮𝓻𝓼'),
      CA('ʍıʇɥ ɹǝɐlıʇʎ'),
    ]);

    StartJobs();
    return;
  }
}
