/**
 * {@link https://sqlite.org/lang_createtable.html}
 */

import type { TColumnDefinition } from './columns';

export type TDatabaseName = 'main' | 'temp' | string;

export interface TTableConstraint {
  primaryKey?: string[];
  unique?: string[];
  check?: string;
  foreignKey?: {
    column: string;
    references: {
      table: string;
      column: string;
    };
  };
}

export interface TCreateTableOptions {
  temporary?: boolean;
  ifNotExists?: boolean;
}

export interface TCreateTableStatement {
  name: TDatabaseName;
  columns: TColumnDefinition[];
  constraints?: TTableConstraint;
  options?: TCreateTableOptions;
}

export type TCreateTableStatementOptionals = Partial<
  Omit<TCreateTableStatement, 'name' | 'columns'>
>;
