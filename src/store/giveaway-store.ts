import type {
  TGiveawayChannelRecordsSQL,
  TGiveawayChannelType,
  TGiveawayRecordSQL,
} from '@/giveaways';
import type { TextBasedChannel, User } from 'discord.js';
import { BaseStoreSQL } from './base-store';
import { envParseString } from '@skyra/env-utilities';
import type { TInsertOptions } from '@/sql/base-store';
import type { RunResult } from 'sqlite3';

export class GiveawayChannelStore extends BaseStoreSQL<TGiveawayChannelRecordsSQL> {
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
      { tableStatement: { constraints: { unique: ['id', 'type'] } } }
    );
  }

  saveChannel(channel: TextBasedChannel, user?: User) {
    const { parentID, type } = this.getParent(channel, user);
    return this.insert(
      { parent_id: parentID, type, channel: channel.id },
      { or: 'REPLACE' }
    );
  }

  deleteChannel(channel: TextBasedChannel, user?: User) {
    const { parentID, type } = this.getParent(channel, user);
    return this.delete({ parent_id: parentID, type });
  }

  deleteChannelUsingRecord(record: Partial<TGiveawayChannelRecordsSQL>) {
    return this.delete(record);
  }

  getParent(
    channel: TextBasedChannel,
    user?: User
  ): {
    parentID: string;
    type: TGiveawayChannelType;
  } {
    if (channel.isDMBased()) {
      if (!user)
        throw new Error(
          `Since channel ${channel.id} is DM based, user is required`
        );
      return { parentID: user.id, type: 'DM' };
    } else {
      return { parentID: channel.guildId, type: 'GUILD' };
    }
  }
}

/**
 * Make sure to initialize {@link GiveawayChannelStore} before this, as it
 *  depends on it's table
 */
export class FetchedGiveawayStore extends BaseStoreSQL<TGiveawayRecordSQL> {
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
          primaryKey: true,
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
            },
          },
        },
      }
    );
  }

  async initialize(): Promise<RunResult> {
    await super.initialize();
    return this.createUpdateOnTrigger('updated_date');
  }

  insert(
    values: Omit<TGiveawayRecordSQL, 'created_date' | 'updated_date'>,
    options?: TInsertOptions
  ) {
    return super.insert(values, options || { onConflictUpdate: true });
  }

  async insertWithChannel(
    channel: TextBasedChannel,
    values: Omit<TGiveawayRecordSQL, 'created_date' | 'updated_date'>,
    options?: TInsertOptions
  ) {
    const channelStore = this.getCoupledTables().GiveawayChannelStore;
    const regularChannel = await channelStore.get({ channel: channel.id });
    if (!regularChannel) throw new Error('Channel not subscribed');
    return this.insert(
      { ...values, channel_parent_id: regularChannel.id },
      options || { onConflictUpdate: true }
    );
  }

  // TODO: finish this
  getNotifyChannel(channel: TextBasedChannel) {}

  protected getCoupledTables() {
    return { GiveawayChannelStore: new GiveawayChannelStore() };
  }
}
