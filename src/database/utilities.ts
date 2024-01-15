/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely } from 'kysely';
import type { DataTypeExpression } from '../../node_modules/kysely/dist/cjs/parser/data-type-parser.d.ts';
import type {
  ColumnBuilderCallback,
  CreateTableBuilder,
} from '../../node_modules/kysely/dist/cjs/schema/create-table-builder.js';

export type TableBuilderInfo<TI = Record<string, any>> = {
  /** Name of the table */
  _name: string;
  /** Table Column builder info */
  col: {
    [keyTI in keyof TI & string]: TableColumnInfo<keyTI>;
  };
};

export type TableColumnInfo<key extends string = string> = {
  /** Name of the column */
  _name: key;
  builder: ColumnBuilderCallback;
  type: DataTypeExpression;
};

type GetTableInfo<T> = T extends TableBuilderInfo<infer R> ? R : never;

/**
 * Makes Kysely table with default table data
 */
export function makeTableBuilder<
  T extends TableBuilderInfo,
  TI = GetTableInfo<T>,
>(database: Kysely<unknown>, tableInfo: T) {
  let tableCreate: CreateTableBuilder<string, keyof TI & string> =
    database.schema.createTable(tableInfo._name);

  const tableColumnInfo = Object.values(tableInfo.col);
  for (const x of tableColumnInfo) {
    tableCreate = tableCreate.addColumn(x._name, x.type, x.builder);
  }
  return tableCreate;
}
