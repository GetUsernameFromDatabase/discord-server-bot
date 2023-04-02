import type BotActivity from './bot-activity.js';
import type Giveaways from '../giveaways.js';
import {
  Client,
  ClientOptions,
  Collection,
  GatewayDispatchEvents,
} from 'discord.js';
import registerPlayerEvents from './player-events.js';
import { Player } from 'discord-player';
import { GatewayServer, SlashCreator } from 'slash-create';
import { registerAllEvents } from '../events/index.js';
import { registerAllCommands } from '../commands/index.js';

export enum HandlerKeys {
  Giveaways = 'giveaways',
  BotActivity = 'botActivity',
}
type HandlerValues = Giveaways | BotActivity;

export default class DiscordBot extends Client {
  handlers: Collection<HandlerKeys, HandlerValues>;
  player: Player;
  creator!: SlashCreator;
  constructor(options: ClientOptions) {
    super(options);
    this.handlers = new Collection();
    this.player = Player.singleton(this);
    registerPlayerEvents(this.player);
  }
  initiate() {
    this.creator = new SlashCreator({
      applicationID: process.env.DISCORD_CLIENT_ID,
      publicKey: process.env.DISCORD_CLIENT_PUBKEY,
      token: process.env.DISCORD_CLIENT_TOKEN,
      client: this,
    });
    this.creator.withServer(
      new GatewayServer((handler) =>
        this.ws.on(GatewayDispatchEvents.InteractionCreate, handler)
      )
    );

    registerAllEvents();
    registerAllCommands(this.creator);
    this.creator.syncCommands();

    void this.login(process.env.DISCORD_CLIENT_TOKEN);
  }
}
