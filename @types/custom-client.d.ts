import type BotActivity from '../src/bot-activity';
import type Giveaways from '../src/giveaways/giveaways-fetching';

export interface Handlers {
  giveaway: Giveaways;
  botActivity: BotActivity;
}
