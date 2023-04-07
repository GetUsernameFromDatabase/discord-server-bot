import { BucketScope, LogLevel, SapphireClient } from '@sapphire/framework';
import { envParseArray } from '@skyra/env-utilities';
import BotActivity, { CreateActivity as CA } from './bot-activity';
import { Player } from 'discord-player';
import { Collection, GatewayIntentBits } from 'discord.js';
import * as Utils from './helpers/utils';
import { GiveawayChannelStore } from './store/giveaway-store';
import { Update } from '#lib/identification';
import { GiveawayNotifier } from './jobs/giveaways';

interface CustomProperties {
  readonly player: Player;
  readonly utils: typeof Utils;
  readonly giveawayChannels: Collection<string, string>;
  readonly botActivity: BotActivity;
}
export class CustomClient extends SapphireClient implements CustomProperties {
  public player: Player;
  public utils: typeof Utils;
  public giveawayChannels: Collection<string, string>;
  public botActivity!: BotActivity;

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

    const savedGiveawayStore = new GiveawayChannelStore();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    this.giveawayChannels = new Collection(savedGiveawayStore.read());
  }

  public async onReady() {
    await Update.Maintainer(this);
    this.botActivity = new BotActivity(this, [
      CA('with my vodka bottle'),
      CA('𝔀𝓲𝓽𝓱 𝓯𝓵𝓸𝔀𝓮𝓻𝓼'),
      CA('ʍıʇɥ ɹǝɐlıʇʎ'),
    ]);

    this.startJobs();
    return;
  }

  private startJobs() {
    new GiveawayNotifier();
  }
}

declare module 'discord.js' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Client extends CustomProperties {}
}
