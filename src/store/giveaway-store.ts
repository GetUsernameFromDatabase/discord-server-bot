import type { GiveawayObjectJSON } from '@/giveaways';
import { BaseStore } from './base-store';

// TODO: convert this to use sql?
export class FetchedGiveawayStore extends BaseStore<GiveawayObjectJSON[]> {
  constructor() {
    super('./data/FetchedGiveaways.json');
  }
}

export class GiveawayChannelStore extends BaseStore<[string, string][]> {
  constructor() {
    super('./data/GiveawayChannels.json');
  }
}
