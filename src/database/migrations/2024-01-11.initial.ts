import { TableBuilderInfo, makeTableBuilder } from '@/database/utilities';
import { Generated, GeneratedAlways, Kysely, sql } from 'kysely';

// https://kysely.dev/docs/migrations#sqlite-migration-example

// I don't like this but should help unifiy setting some variables
// I must really dislike ctrl+h or :s/old_name/new_name/g
const giveaways: TableBuilderInfo<MigrationInitial_giveaways> = {
  _name: 'giveaways',
  col: {
    id: {
      _name: 'id',
      builder: (col) => col.primaryKey(),
      type: 'integer',
    },
    title: {
      _name: 'title',
      builder: (col) => col.notNull().unique(),
      type: 'text',
    },
    url: {
      _name: 'url',
      builder: (col) => col.notNull(),
      type: 'text',
    },
    created_at: {
      _name: 'created_at',
      builder: (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull(),
      type: 'text',
    },
    last_ping_at: {
      _name: 'last_ping_at',
      builder: (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull(),
      type: 'text',
    },
  },
};

const giveaways_channel_link: TableBuilderInfo<MigrationInitial_giveaways_channel_link> =
  {
    _name: 'giveaways_channel_link',
    col: {
      channel_container: {
        _name: 'channel_container',
        builder: (col) => col.notNull(),
        type: 'text',
      },
      giveaway_id: {
        _name: 'giveaway_id',
        builder: (col) =>
          col
            .notNull()
            .references(`${giveaways._name}.${giveaways.col.id._name}`)
            .onUpdate('cascade')
            .onDelete('cascade'),
        type: 'integer',
      },
    },
  };

/** Make sure to add combination of cha */
const channel_purposes: TableBuilderInfo<MigrationInitial_channel_purposes> = {
  _name: 'channel_purposes',
  col: {
    channel_container: {
      _name: 'channel_container',
      builder: (col) => col.notNull(),
      type: 'text',
    },
    channel_id: {
      _name: 'channel_id',
      builder: (col) => col.notNull(),
      type: 'text',
    },
    channel_purpose: {
      _name: 'channel_purpose',
      builder: (col) => col.notNull(),
      type: 'text',
    },
  },
};

// might delete this at some point -- keeping it here since it was surprisingly painful to setup
// const giveawayTriggerName = `trigger_${giveaways._name}_${giveaways.col.updated_at._name}`;
// const giveawayTrigger = {
//   up: sql`
//     CREATE TRIGGER ${sql.raw(giveawayTriggerName)}
//     AFTER UPDATE OF ${sql.raw(
//       Object.values(giveaways.col)
//         .map((x) => x._name)
//         .filter((x) => x !== 'updated_at')
//         .join(', ')
//     )} ON ${sql.table(giveaways._name)}

//     FOR EACH ROW BEGIN
//       UPDATE ${sql.table(giveaways._name)} SET ${sql.ref(
//         giveaways.col.updated_at._name
//       )} = CURRENT_TIMESTAMP
//       WHERE rowid = NEW.rowid;
//     END;
//   `,
//   down: sql`DELETE trigger ${giveawayTriggerName};`,
// };

export async function up(database: Kysely<unknown>): Promise<void> {
  console.log(`Migrating up in ${__filename}`);

  const table_giveaway = makeTableBuilder(database, giveaways);
  await table_giveaway.execute();

  const table_giveaways_channel_link = makeTableBuilder(
    database,
    giveaways_channel_link
  ).addUniqueConstraint(`unique__${giveaways_channel_link._name}`, [
    'channel_container',
    'giveaway_id',
  ]);
  await table_giveaways_channel_link.execute();

  const table_channel_purposes = makeTableBuilder(database, channel_purposes)
    .addUniqueConstraint(
      `unique__${channel_purposes._name}__channel_and_purpose`,
      ['channel_id', 'channel_purpose']
    )
    .addUniqueConstraint(
      `unique__${channel_purposes._name}__container_and_purpose`,
      ['channel_container', 'channel_purpose']
    );
  await table_channel_purposes.execute();
}

export async function down(database: Kysely<unknown>): Promise<void> {
  console.log(`Migrating down in ${__filename}`);
  await database.schema.dropTable(channel_purposes._name).execute();
  await database.schema.dropTable(giveaways_channel_link._name).execute();
  await database.schema.dropTable(giveaways._name).execute();
}

// --- TYPES BELOW

/** goal: store information about giveaways */
export interface MigrationInitial_giveaways {
  id: Generated<number>;
  title: string;
  url: string;
  created_at: GeneratedAlways<Date>;
  last_ping_at: Generated<Date>;
}

/** goal: to know where giveaways have been sent */
export interface MigrationInitial_giveaways_channel_link {
  /**
   * {@link MigrationInitial_giveaways}
   */
  giveaway_id: MigrationInitial_giveaways['id'];
  /** Id of container of channel -- user/guild */
  channel_container: string;
}

/** goal: to know where to send stuff */
export interface MigrationInitial_channel_purposes {
  /** Id of container of channel -- user/guild*/
  channel_container: string;
  channel_id: string;
  /**
   * Channel reason, the way it is used for
   * for example a giveaway channel
   *
   * Feel free to change literal types here, just for autocomplete purposes
   */
  channel_purpose: 'givaways';
}
