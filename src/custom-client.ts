import './helpers/setup';
import { BucketScope, LogLevel, SapphireClient } from '@sapphire/framework';
import { envParseArray } from '@skyra/env-utilities';
import BotActivity, { CreateActivity as CA } from './bot-activity';
import { Player } from 'discord-player';
import { GatewayIntentBits } from 'discord.js';
import * as Utils from './helpers/discord-utils';
import { Update } from '#lib/identification';
import { initializeStores, stores } from './store';
import { StartJobs } from './jobs';

interface CustomProperties {
  readonly player: Player;
  readonly utils: typeof Utils;
  readonly botActivity: BotActivity;
  readonly sqlStores: typeof stores;
}
export class CustomClient extends SapphireClient implements CustomProperties {
  player;
  utils;
  sqlStores;
  botActivity!: BotActivity;

  constructor() {
    super({
      disableMentionPrefix: true,
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
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
    this.sqlStores = stores;
  }

  public async onReady() {
    await Update.Maintainer(this);
    await initializeStores();
    this.botActivity = new BotActivity(this, [
      CA('with my vodka bottle'),
      CA('𝔀𝓲𝓽𝓱 𝓯𝓵𝓸𝔀𝓮𝓻𝓼'),
      CA('ʍıʇɥ ɹǝɐlıʇʎ'),
    ]);

    StartJobs();
    return;
  }
}

declare module 'discord.js' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Client extends CustomProperties {}
}
