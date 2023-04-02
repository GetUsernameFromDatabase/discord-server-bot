import type {
  GiveawayObject,
  TGiveawayChannelRecordsInsertSQL,
  TGiveawayChannelRecordsSQL,
  TGiveawayRecordSQL,
} from '@/giveaways';
import type { TextBasedChannel } from 'discord.js';
import { BaseStoreSQL } from './base-store';
import { envParseString } from '@skyra/env-utilities';
import type { TInsertOptions } from '@/sql/base-store';
import type { RunResult } from 'sqlite3';
import { getChannelParentID } from '../helpers/discord-utils';

export class GiveawayChannelStore extends BaseStoreSQL<
  TGiveawayChannelRecordsSQL,
  TGiveawayChannelRecordsInsertSQL
> {
  static tableName = 'channels_to_notify';

  constructor() {
    const databaseName = envParseString('GIVEAWAY_DATABASE_NAME');
    super(
      `./data/${databaseName}`,
      GiveawayChannelStore.tableName,
      {
        id: { type: 'INTEGER', primaryKey: true },
        parent_id: { type: 'TEXT', notNull: true },
        type: { type: 'TEXT', notNull: true },
        channel: { type: 'TEXT', notNull: true },
      },
      { tableStatement: { constraints: { unique: ['parent_id', 'type'] } } }
    );
  }

  saveChannel(channel: TextBasedChannel) {
    const { id, type } = getChannelParentID(channel);
    return this.insert(
      { parent_id: id, type, channel: channel.id },
      { onConflictUpdate: true }
    );
  }

  deleteChannel(channel: TextBasedChannel) {
    const { id, type } = getChannelParentID(channel);
    return this.delete({ parent_id: id, type });
  }

  deleteChannelUsingRecord(record: Partial<TGiveawayChannelRecordsSQL>) {
    return this.delete(record);
  }
}

/**
 * Make sure to initialize {@link GiveawayChannelStore} before this, as it
 *  depends on it's table
 */
export class FetchedGiveawayStore extends BaseStoreSQL<
  TGiveawayRecordSQL,
  TGiveawayRecordSQL
> {
  static tableName = 'fetched_giveaways';

  constructor() {
    // TODO: make this connected with channels_to_notify
    const databaseName = envParseString('GIVEAWAY_DATABASE_NAME');
    super(
      `./data/${databaseName}`,
      FetchedGiveawayStore.tableName,
      {
        channel_parent_id: {
          type: 'INTEGER',
          notNull: true,
        },
        title: {
          type: 'TEXT',
          notNull: true,
          collate: 'RTRIM',
        },
        url: { type: 'TEXT', notNull: true, collate: 'RTRIM' },
        created_date: {
          type: 'TEXT',
          notNull: true,
          defaultValue: 'CURRENT_TIMESTAMP',
        },
        updated_date: {
          type: 'TEXT',
          notNull: true,
          defaultValue: 'CURRENT_TIMESTAMP',
        },
      },
      {
        tableStatement: {
          constraints: {
            foreignKey: {
              column: 'channel_parent_id',
              references: {
                column: 'id',
                table: GiveawayChannelStore.tableName,
              },
              onDelete: 'CASCADE',
              onUpdate: 'CASCADE',
            },
            unique: ['channel_parent_id', 'title'],
          },
        },
      }
    );
  }

  async initialize(): Promise<RunResult> {
    await super.initialize();
    return this.createUpdateOnTrigger('updated_date');
  }

  /** MODIFED */
  insert(
    values: Omit<TGiveawayRecordSQL, 'created_date' | 'updated_date'>,
    options?: TInsertOptions
  ) {
    return super.insert(values, options || { onConflictUpdate: true });
  }

  async getNotifyChannel(channel: TextBasedChannel) {
    const channelStore = this.getCoupledTables().GiveawayChannelStore;
    return channelStore.get({ channel: channel.id });
  }

  async insertWithChannel(
    channel: TextBasedChannel,
    values: Omit<TGiveawayRecordSQL, 'created_date' | 'updated_date'>,
    options?: TInsertOptions
  ) {
    const notifyChannel = await this.getNotifyChannel(channel);
    if (!notifyChannel) throw new Error('Channel not subscribed');
    return this.insert(
      { ...values, channel_parent_id: notifyChannel.id },
      options || { onConflictUpdate: true }
    );
  }

  async selectWithChannel<K extends keyof TGiveawayRecordSQL>(
    channel: TextBasedChannel,
    pickedValues?: K[]
  ) {
    const notifyChannel = await this.getNotifyChannel(channel);
    if (!notifyChannel) return;
    return this.select({ channel_parent_id: notifyChannel.id }, pickedValues);
  }

  async saveSentGiveaways(
    channel: TextBasedChannel,
    giveaways: GiveawayObject[]
  ) {
    const { id } = getChannelParentID(channel);
    const notifyChannel = await this.getNotifyChannel(channel);
    if (!notifyChannel)
      return globalThis.logger.info(
        `Channel ${id} not subscribed. Will not store sent giveaways`
      );
    const giveawayInserts = giveaways.map((x) =>
      this.insert({
        title: x.title,
        url: x.url,
        channel_parent_id: notifyChannel.id,
      })
    );
    /** Giveaway Inserts Promise */
    const gip = await Promise.all(giveawayInserts);
    globalThis.logger.info(
      `SQL[${this.constructor.name}]: Stored ${gip.length} giveaways`
    );
    return gip;
  }

  getCoupledTables() {
    return { GiveawayChannelStore: new GiveawayChannelStore() };
  }
}
