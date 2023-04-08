import type { GiveawayObjectJSON } from '@/giveaways';
import type { TextBasedChannel, User } from 'discord.js';
import { BaseStore } from './base-store';

// TODO: convert to use sqllite https://www.npmjs.com/package/sqlite3
export enum GiveawayChannelTypes {
  DM = 'DM',
  GUILD = 'GUILD',
}

export class GiveawayChannelStore extends BaseStore<[string, string][]> {
  constructor() {
    super('./data/GiveawayChannels.json');
  }

  static generateKey(channel: TextBasedChannel, user?: User) {
    if (channel.isDMBased()) {
      if (!user)
        throw new Error(
          `Since channel ${channel.id} is DM based, user is required`
        );
      return `${GiveawayChannelTypes.DM}_${user.id}`;
    }
    return `${GiveawayChannelTypes.GUILD}_${channel.guildId}`;
  }
}

export class FetchedGiveawayStore extends BaseStore<GiveawayObjectJSON[]> {
  constructor() {
    super('./data/FetchedGiveaways.json');
  }
}
