import type { TColumnDefinition } from '@/sql/columns';
import type { TCreateTableStatement, TTableConstraint } from '@/sql/tables';
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
  if (constraints.primaryKey) {
    tableConstraints += `PRIMARY KEY (${constraints.primaryKey.join(', ')})`;
  } else if (constraints.unique) {
    tableConstraints += `UNIQUE (${constraints.unique.join(', ')})`;
  } else if (constraints.check) {
    tableConstraints += `CHECK (${constraints.check})`;
  } else if (constraints.foreignKey) {
    tableConstraints +=
      `FOREIGN KEY (${constraints.foreignKey.column}) REFERENCES` +
      ` ${constraints.foreignKey.references.table}` +
      `(${constraints.foreignKey.references.column})`;
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
