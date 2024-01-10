import {
  ColumnType,
  Generated,
  Insertable,
  Selectable,
  Updateable,
  Kysely,
  SqliteDialect,
} from 'kysely';
import SQLite from 'better-sqlite3';
import { resolveFromDataPath } from '#lib/pathing';

export interface TDatabaseGiveaways {
  giveaways: TGiveawaysTable;
  giveaways_channel_link: TGiveawaysSentToChannel;
}

const DatabaseGiveawaysPath = resolveFromDataPath('giveaways.db');
const dialect = new SqliteDialect({
  database: new SQLite(DatabaseGiveawaysPath),
});
export const DatabaseGiveaways = new Kysely<TDatabaseGiveaways>({
  dialect,
});

export interface TGiveawaysTable {
  id: Generated<number>;
  title: string;
  url: string;
  created_at: ColumnType<Date, string | undefined, never>;
  last_looked_for: ColumnType<Date, string | undefined, string | undefined>;
}
export type GiveawaySelect = Selectable<TGiveawaysTable>;
export type GiveawayInsert = Insertable<TGiveawaysTable>;
export type GiveawayUpdate = Updateable<TGiveawaysTable>;

export interface TGiveawaysSentToChannel {
  channel: string;
  channel_type: string;
  /** {@link TGiveawaysTable} */
  giveaway_id: number;
}
export type GiveawaySentToChannelSelect = Selectable<TGiveawaysSentToChannel>;
export type GiveawaySentToChannelInsert = Insertable<TGiveawaysSentToChannel>;
export type GiveawaySentToChannelUpdate = Updateable<TGiveawaysSentToChannel>;
