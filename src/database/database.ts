import {
  Insertable,
  Selectable,
  Updateable,
  Kysely,
  SqliteDialect,
  Migrator,
  FileMigrationProvider,
  sql,
} from 'kysely';
import SQLite from 'better-sqlite3';
import { resolveFromDataPath } from '#lib/pathing';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import {
  MigrationInitial_channel_purposes,
  MigrationInitial_giveaways,
  MigrationInitial_giveaways_channel_link,
} from './migrations/2024-01-11.initial';

/** TODO: add tests for this */
export const DB = setupSqliteDatabase('database.sqlite');

export function setupSqliteDatabase(fileName: string) {
  const databasePath = resolveFromDataPath(fileName);
  console.log(`Setting up sql database "${databasePath}"`);

  const dialect = new SqliteDialect({
    database: new SQLite(databasePath),
  });
  const database = new Kysely<TDatabase>({
    dialect,
    // TODO: decide if to remove 'query' or not
    log: ['error', 'query'],
  });

  // https://github.com/WiseLibs/better-sqlite3#usage
  // not sure if kysely already does that
  void sql`PRAGMA journal_mode = WAL;`.execute(database);

  const migrator = new Migrator({
    db: database,
    provider: new FileMigrationProvider({
      migrationFolder: path.resolve(__dirname, 'migrations'),
      fs,
      path,
    }),
  });
  void migrator.migrateToLatest();
  return database;
}

// --- types below ---
export interface TDatabase {
  giveaways: giveaways;
  giveaways_channel_link: giveaways_channel_link;
  channel_purposes: channel_purposes;
}

type giveaways = MigrationInitial_giveaways;
export type giveaways_Select = Selectable<giveaways>;
export type giveaways_Insert = Insertable<giveaways>;
export type giveaways_Update = Updateable<giveaways>;

type giveaways_channel_link = MigrationInitial_giveaways_channel_link;
export type giveaways_channel_link_Select = Selectable<giveaways_channel_link>;
export type giveaways_channel_link_Insert = Insertable<giveaways_channel_link>;
export type giveaways_channel_link_Update = Updateable<giveaways_channel_link>;

type channel_purposes = MigrationInitial_channel_purposes;
export type channel_purposes_Select = Selectable<channel_purposes>;
export type channel_purposes_Insert = Insertable<channel_purposes>;
export type channel_purposes_Update = Updateable<channel_purposes>;
