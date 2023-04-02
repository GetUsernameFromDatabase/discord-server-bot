/**
 * {@link https://sqlite.org/lang_createtable.html}
 */

import type { TColumnDefinition } from './columns';

export type TDatabaseName = 'main' | 'temp' | string;

export type OnActions =
  | 'NO ACTION'
  | 'RESTRICT'
  | 'SET NULL'
  | 'SET DEFAULT'
  | 'CASCADE';

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
    onDelete?: OnActions;
    onUpdate?: OnActions;
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
