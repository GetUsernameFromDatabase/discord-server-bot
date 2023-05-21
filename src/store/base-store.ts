import { makeSureTableExists as ensureTableExists } from '../SQL/create-table';
import path from 'node:path';
import * as sqlite3 from 'sqlite3';
import type {
  TCreateTableStatement,
  TCreateTableStatementOptionals,
} from '@/sql/tables';
import type {
  TColumnDefinition,
  TColumnDefinitionNameless,
  TColumnCreatorOptions,
} from '@/sql/columns';
import type {
  TCreateUpdateOnTriggerOptions,
  TInsertOptions,
} from '@/sql/base-store';
import type { Optional, PickByKeysOrFull } from '@/typescript-utils';
import { getQueryParts, getSelectPart } from '../SQL/query-parts';
import { rejectAndLog } from '../SQL/error-handling';

export interface TBaseStoreSQLOptions {
  tableStatement: TCreateTableStatementOptionals;
}

export abstract class BaseStoreSQL<
  TRecordSQL extends object,
  TInsertSQL extends object
> {
  databaseLocation: string;
  database: sqlite3.Database;
  tableName: string;
  columns: TColumnCreatorOptions<TRecordSQL>;
  additionalOptions?: TBaseStoreSQLOptions;

  constructor(
    location: string,
    tableName: string,
    columns: TColumnCreatorOptions<TRecordSQL>,
    options?: TBaseStoreSQLOptions
  ) {
    this.databaseLocation = path.resolve(location);
    this.database = new sqlite3.Database(this.databaseLocation);
    this.tableName = tableName;
    this.columns = columns;
    this.additionalOptions = options;
  }

  async initialize() {
    await new Promise((resolve, reject) => {
      const query = 'PRAGMA foreign_keys = ON;';
      this.database.run(query, function (error) {
        if (error) rejectAndLog(query, error, reject);
        resolve(this);
      });
    });
    return this.makeSureTableExists({
      columns: this.convertColumnCreationOptions(this.columns),
      ...this.additionalOptions?.tableStatement,
    });
  }

  /**
   * Raw Base Version -- Extended class most likely has something better
   */
  select<K extends keyof TRecordSQL>(
    whereValues: Partial<TRecordSQL> | 'ALL',
    pickedValues?: K[]
  ) {
    const { bindings, wherePart } = getQueryParts(whereValues);
    const where = wherePart.join(' AND ');
    const selectPart = getSelectPart(pickedValues);

    let query = `SELECT ${selectPart} FROM ${this.tableName}`;
    if (whereValues !== 'ALL') {
      query += ` WHERE ${where}`;
    }

    return new Promise<PickByKeysOrFull<TRecordSQL, K>[]>((resolve, reject) => {
      this.database.all(query, bindings, (error, rows) => {
        if (error) rejectAndLog(query, error, reject);
        resolve(rows as TRecordSQL[]);
      });
    });
  }

  /**
   * Raw Base Version -- Extended class most likely has something better
   */
  get<K extends keyof TRecordSQL>(
    whereValues: Partial<TRecordSQL>,
    pickedValues?: K[]
  ) {
    const { bindings, wherePart } = getQueryParts(whereValues);
    const where = wherePart.join(' AND ');
    const selectPart = getSelectPart(pickedValues);

    const query = `SELECT ${selectPart} FROM ${this.tableName} WHERE ${where}`;
    // TODO: check the value if empty
    return new Promise<PickByKeysOrFull<TRecordSQL, K> | undefined>(
      (resolve, reject) => {
        this.database.get(query, bindings, (error, rows) => {
          if (error) rejectAndLog(query, error, reject);
          resolve(rows as TRecordSQL);
        });
      }
    );
  }

  /**
   * Raw Base Version -- Extended class most likely has something better
   */
  delete(whereValues: Partial<TRecordSQL> | 'ALL') {
    const { bindings, wherePart } = getQueryParts(whereValues);

    let query = `DELETE FROM ${this.tableName}`;
    if (whereValues !== 'ALL') {
      query += ` WHERE ${wherePart.join(' AND ')}`;
    }

    return new Promise<sqlite3.RunResult>((resolve, reject) => {
      this.database.run(query, bindings, function (error) {
        if (error) rejectAndLog(query, error, reject);
        resolve(this);
      });
    });
  }

  /**
   * Raw Base Version -- Extended class most likely has something better
   */
  insert(values: TInsertSQL, options?: TInsertOptions) {
    // TODO: accept values[]
    const { bindings, columnPart, valuePart, setPart } = getQueryParts(values);

    let query = `INSERT ${options?.or ? `OR ${options.or}` : ''} 
    INTO ${this.tableName} (${columnPart})
    VALUES (${valuePart}) `;
    if (options?.onConflictUpdate) {
      query += `\nON CONFLICT DO UPDATE SET ${setPart}`;
    }

    return new Promise<sqlite3.RunResult>((resolve, reject) => {
      this.database.run(query, bindings, function (error) {
        if (error) rejectAndLog(query, error, reject);
        resolve(this);
      });
    });
  }

  /**
   * Creates an update on trigger based on
   * {@link https://stackoverflow.com/a/67298398}
   */
  createUpdateOnTrigger(
    column: keyof TRecordSQL,
    options?: Partial<TCreateUpdateOnTriggerOptions>
  ) {
    const o: TCreateUpdateOnTriggerOptions = {
      triggerName: `${this.tableName}_update_on_trigger`,
      dateFunction: 'datetime',
      ...options,
    };

    const tableColumns = Object.keys(this.columns);
    const columnIndex = tableColumns.indexOf(String(column));

    if (columnIndex === -1)
      throw new Error(
        `${String(column)} not found from [${tableColumns.join(', ')}]`
      );
    tableColumns.splice(columnIndex, 1);

    const query = `CREATE TRIGGER IF NOT EXISTS ${o.triggerName}
    AFTER UPDATE OF ${tableColumns.join(', ')} ON ${this.tableName}
    FOR EACH ROW BEGIN UPDATE ${this.tableName}
    SET ${String(column)} = ${o.dateFunction}('now')
    WHERE rowid = new.rowid ; END;`;
    return new Promise<sqlite3.RunResult>((resolve, reject) => {
      this.database.run(query, function (error) {
        if (error) rejectAndLog(query, error, reject);
        resolve(this);
      });
    });
  }

  /**
   * Converts column creation options to column definitions
   * TODO: externalise to SQL section
   */
  protected convertColumnCreationOptions(
    enforcedColumns: TColumnCreatorOptions<TRecordSQL>
  ) {
    return Object.entries<TColumnDefinitionNameless>(enforcedColumns).map(
      ([key, value]) => {
        const column: TColumnDefinition = { name: key, ...value };
        return column;
      }
    );
  }

  /**
   * DEFAULTS:
   * - `name: this.tableName`
   * - `options: { ifNotExists: true }`
   *
   * {@link ensureTableExists}
   */
  protected makeSureTableExists(
    tableOptions: Optional<TCreateTableStatement, 'name' | 'options'>
  ) {
    const { query, result } = ensureTableExists(
      this.tableName,
      this.database,
      tableOptions
    );
    globalThis.logger.debug(`SQL[${this.constructor.name}]:`, query);
    return result;
  }
}
