import type { Handlers } from '@/custom-client';
import { BucketScope, LogLevel, SapphireClient } from '@sapphire/framework';
import { envParseArray } from '@skyra/env-utilities';
import BotActivity, { CreateActivity as CA } from './bot-activity';
import { Player } from 'discord-player';
import { GatewayIntentBits } from 'discord.js';
import Giveaways from './giveaways/giveaways-fetching';
import * as Utils from './helpers/utils';

export class CustomClient extends SapphireClient {
  public player: Player;
  public handlers!: Handlers;
  public utils: typeof Utils;
  public constructor() {
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
        level: LogLevel.Info,
      },
    });
    this.utils = Utils;
    this.player = Player.singleton(this);
  }

  public initiate() {
    this.handlers = {
      giveaway: new Giveaways(this),
      botActivity: new BotActivity(this, [
        CA('with my vodka bottle'),
        CA('𝔀𝓲𝓽𝓱 𝓯𝓵𝓸𝔀𝓮𝓻𝓼'),
        CA('ʍıʇɥ ɹǝɐlıʇʎ'),
      ]),
    };
  }
}

declare module 'discord.js' {
  interface Client {
    readonly player: Player;
    readonly utils: typeof Utils;
    readonly handlers: Handlers;
  }
}
