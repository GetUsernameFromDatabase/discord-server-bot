import type { TColumnDefinition } from '@/sql/columns';
import type { TCreateTableStatement, TTableConstraint } from '@/sql/tables';
import type { Optional } from '@/typescript-utils';
import type { Database, RunResult } from 'sqlite3';
import { rejectAndLog } from './error-handling';
/**
 * {@link https://sqlite.org/lang_createtable.html}
 */
export function getCreateTableQuery(table: TCreateTableStatement): string {
  let statement = 'CREATE';

  if (table.options?.temporary) {
    statement += ' TEMPORARY';
  }
  statement += ' TABLE';
  if (table.options?.ifNotExists) {
    statement += ' IF NOT EXISTS';
  }
  statement += ` ${table.name} (`;

  const columnDefinitions = generateTableColumns(table.columns);
  statement += columnDefinitions.join(', ');

  if (table.constraints) {
    const tableConstraints = generateTableConstraints(table.constraints);
    statement += `, ${tableConstraints}`;
  }

  statement += ');';
  return statement;
}

function generateTableConstraints(constraints: TTableConstraint) {
  let tableConstraints = '';
  let firstConstraint = true;
  function accountForFirstConstraint() {
    if (!firstConstraint) tableConstraints += ', ';
    firstConstraint = false;
  }
  if (constraints.primaryKey) {
    accountForFirstConstraint();
    tableConstraints += `PRIMARY KEY (${constraints.primaryKey.join(', ')})`;
  }
  if (constraints.unique) {
    accountForFirstConstraint();
    tableConstraints += `UNIQUE (${constraints.unique.join(', ')})`;
  }
  if (constraints.check) {
    accountForFirstConstraint();
    tableConstraints += `CHECK (${constraints.check})`;
  }
  if (constraints.foreignKey) {
    accountForFirstConstraint();
    tableConstraints +=
      `FOREIGN KEY (${constraints.foreignKey.column}) REFERENCES` +
      ` ${constraints.foreignKey.references.table}` +
      `(${constraints.foreignKey.references.column})`;
    if (constraints.foreignKey.onDelete) {
      tableConstraints += ` ON DELETE ${constraints.foreignKey.onDelete}`;
    }
    if (constraints.foreignKey.onUpdate) {
      tableConstraints += ` ON UPDATE ${constraints.foreignKey.onUpdate}`;
    }
    firstConstraint = false;
  }
  return tableConstraints;
}

function generateTableColumns(columns: TColumnDefinition[]) {
  return columns.map((column) => {
    let columnDefinition = `${column.name}`;
    if (column.type) {
      columnDefinition += ` ${column.type}`;
    }
    if (column.primaryKey) {
      columnDefinition += ' PRIMARY KEY';
    }
    if (column.notNull) {
      columnDefinition += ' NOT NULL';
    }
    if (column.unique) {
      columnDefinition += ' UNIQUE';
    }
    if (column.check) {
      columnDefinition += ` CHECK (${column.check})`;
    }
    if (column.defaultValue) {
      columnDefinition += ` DEFAULT ${column.defaultValue}`;
    }
    if (column.collate) {
      columnDefinition += ` COLLATE ${column.collate}`;
    }
    return columnDefinition;
  });
}

/**
 * SQLite links:\
 * {@link [SQLite Create Table](https://sqlite.org/lang_createtable.html)}\
 * {@link [Datatypes](https://sqlite.org/datatype3.html)}
 */
export function makeSureTableExists(
  name: string,
  database: Database,
  tableOptions: Optional<TCreateTableStatement, 'name' | 'options'>
) {
  const query = getCreateTableQuery({
    name,
    options: { ifNotExists: true },
    ...tableOptions,
  });

  const result = new Promise<RunResult>((resolve, reject) => {
    database.run(query, function (error) {
      if (error) rejectAndLog(query, error, reject);
      resolve(this);
    });
  });
  return { result, query };
}
