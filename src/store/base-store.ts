import { getCreateTableQuery } from '../SQL/create-table';
import path from 'node:path';
import * as sqlite3 from 'sqlite3';
import type {
  TCreateTableStatement,
  TCreateTableStatementOptionals,
} from '@/sql/tables';
import type { Optional } from '@/utils';
import type {
  TColumnDefinition,
  TColumnDefinitionNameless,
  TColumnCreatorOptions,
} from '@/sql/columns';
import type {
  TCreateUpdateOnTriggerOptions,
  TInsertOptions,
} from '@/sql/base-store';

export interface TBaseStoreSQLOptions {
  tableStatement: TCreateTableStatementOptionals;
}

export abstract class BaseStoreSQL<TSqlRecord> {
  databaseLocation: string;
  database: sqlite3.Database;
  tableName: string;
  columns: TColumnCreatorOptions<TSqlRecord>;
  additionalOptions?: TBaseStoreSQLOptions;

  constructor(
    location: string,
    tableName: string,
    columns: TColumnCreatorOptions<TSqlRecord>,
    options?: TBaseStoreSQLOptions
  ) {
    this.databaseLocation = path.resolve(location);
    this.database = new sqlite3.Database(this.databaseLocation);
    this.tableName = tableName;
    this.columns = columns;
    this.additionalOptions = options;
  }

  initialize() {
    return this.makeSureTableExists({
      columns: this.convertColumnCreationOptions(this.columns),
      ...this.additionalOptions?.tableStatement,
    });
  }

  select(whereValues: Partial<TSqlRecord> | 'ALL') {
    const { bindings, wherePart } = this.getQueryParts(whereValues);

    let query = `SELECT * FROM ${this.tableName}`;
    if (whereValues !== 'ALL') {
      query += ` WHERE ${wherePart.join(' AND ')}`;
    }

    return new Promise<TSqlRecord[]>((resolve, reject) => {
      this.database.all(query, bindings, (error, rows) => {
        if (error) reject(error);
        resolve(rows as TSqlRecord[]);
      });
    });
  }

  get(whereValues: Partial<TSqlRecord>) {
    const { bindings, wherePart } = this.getQueryParts(whereValues);
    const where = wherePart.join(' AND ');

    const query = `SELECT * FROM ${this.tableName} WHERE ${where}`;
    // TODO: check the value if empty
    return new Promise<TSqlRecord | undefined>((resolve, reject) => {
      this.database.get(query, bindings, (error, rows) => {
        if (error) reject(error);
        resolve(rows as TSqlRecord);
      });
    });
  }

  delete(whereValues: Partial<TSqlRecord> | 'ALL') {
    const { bindings, wherePart } = this.getQueryParts(whereValues);

    let query = `DELETE FROM ${this.tableName}`;
    if (whereValues !== 'ALL') {
      query += ` WHERE ${wherePart.join(' AND ')}`;
    }

    return new Promise<sqlite3.RunResult>((resolve, reject) => {
      this.database.run(query, bindings, function (error) {
        if (error) reject(error);
        resolve(this);
      });
    });
  }

  insert(values: TSqlRecord, options?: TInsertOptions) {
    // TODO: accept values[]
    const { bindings, columnPart, valuePart, setPart } =
      this.getQueryParts(values);

    let query = `INSERT ${options?.or ? `OR ${options.or}` : ''} 
    INTO ${this.tableName} (${columnPart})
    VALUES (${valuePart}) `;
    if (options?.onConflictUpdate) {
      query += `\nON CONFLICT DO UPDATE SET ${setPart}`;
    }

    return new Promise<sqlite3.RunResult>((resolve, reject) => {
      this.database.run(query, bindings, function (error) {
        if (error) reject(error);
        resolve(this);
      });
    });
  }

  /**
   * Creates an update on trigger based on
   * {@link https://stackoverflow.com/a/67298398}
   */
  createUpdateOnTrigger(
    column: keyof TSqlRecord,
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
        if (error) reject(error);
        resolve(this);
      });
    });
  }

  /**
   * Converts column creation options to column definitions
   */
  protected convertColumnCreationOptions(
    enforcedColumns: TColumnCreatorOptions<TSqlRecord>
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
   * SQLite links:\
   * {@link [SQLite Create Table](https://sqlite.org/lang_createtable.html)}\
   * {@link [Datatypes](https://sqlite.org/datatype3.html)}
   */
  protected makeSureTableExists(
    tableOptions: Optional<TCreateTableStatement, 'name' | 'options'>
  ) {
    const query = getCreateTableQuery({
      name: this.tableName,
      options: { ifNotExists: true },
      ...tableOptions,
    });
    globalThis.logger.debug(`TableMaker[${this.constructor.name}]:`, query);
    return new Promise<sqlite3.RunResult>((resolve, reject) => {
      this.database.run(query, function (error) {
        if (error) reject(error);
        resolve(this);
      });
    });
  }

  /**
   * Gets parts usable for queries -- convenience function, 
   *  most likely inefficient
   // TODO: make sure to check if something is added that uses setPart
   */
  protected getQueryParts(values?: Partial<TSqlRecord> | 'ALL'): {
    bindings: { [key: string]: unknown };
    wherePart: string[];
    columnPart: string;
    valuePart: string;
    setPart: string;
  } {
    const bindings: { [key: string]: unknown } = {};
    const wherePart: string[] = [];
    if (!values || typeof values === 'string') {
      return {
        bindings,
        wherePart,
        columnPart: '',
        valuePart: '',
        setPart: '',
      };
    }

    const columnPart = [];
    const valuePart = [];
    const setPart = [];

    for (const [key, value] of Object.entries(values)) {
      bindings[`$${key}`] = value;
      wherePart.push(`${key} = $${key}`);
      columnPart.push(key);
      valuePart.push(`$${key}`);
      const setValue = typeof value === 'string' ? `"${value}"` : String(value);
      setPart.push(`${key} = ${setValue}`);
    }

    /** Comma Seperated Join */
    const csj = ', ';
    return {
      bindings,
      wherePart,
      columnPart: columnPart.join(csj),
      valuePart: valuePart.join(csj),
      setPart: setPart.join(csj),
    };
  }
}
