import type { PartialPick } from './typescript-utils';

export type TGiveawayChannelType = 'DM' | 'GUILD';

export interface TGiveawayChannelRecordsSQL {
  id: number;
  parent_id: string;
  type: TGiveawayChannelType;
  channel: string;
}

export type TGiveawayChannelRecordsInsertSQL = PartialPick<
  TGiveawayChannelRecordsSQL,
  'id'
>;

export interface TGiveawayRecordSQL {
  channel_parent_id: number;
  title: string;
  url: string;
  /** ISO String */
  created_date?: string;
  /** ISO String */
  updated_date?: string;
}

export interface GiveawayObject {
  title: string;
  url: string;
  body: string;
  imageURL?: string;
}

export interface GiveawaySite {
  url: string;
  parse: (html: string) => GiveawayObject[] | Promise<GiveawayObject[]>;
}

export interface GiveawaySites {
  [x: string]: GiveawaySite;
}

export interface PostGiveawayOptions {
  /**
   * Whether to filter giveaways using local DB\
   * Default: `false`
   */
  noFilter: boolean;
  /**
   * Does not check previous messages when sending giveaways\
   * Default: `false`
   */
  ignorePreviousMessage: boolean;
}
