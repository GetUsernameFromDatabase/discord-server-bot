import { GiveawayChannelStore, FetchedGiveawayStore } from './giveaway-store';

export const stores = {
  GiveawayChannel: new GiveawayChannelStore(),
  FetchedGiveaways: new FetchedGiveawayStore(),
};

export async function initializeStores() {
  for (const [, value] of Object.entries(stores)) {
    await value.initialize();
  }
  return;
}
