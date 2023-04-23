/**
 * {@link https://sqlite.org/lang_createtable.html}
 */

export type TColumnType = 'NULL' | 'INTEGER' | 'REAL' | 'TEXT' | 'BLOB';
export type TCollate = 'BINARY' | 'NOCASE' | 'RTRIM';
export type TConflictClause =
  | 'ABORT'
  | 'FAIL'
  | 'IGNORE'
  | 'REPLACE'
  | 'ROLLBACK';

export interface TColumnDefinition {
  name: string;
  type?: TColumnType;
  primaryKey?: boolean;
  notNull?: boolean;
  unique?: boolean;
  check?: string;
  defaultValue?: string | number | null;
  collate?: TCollate;
}
export type TColumnDefinitionNameless = Omit<TColumnDefinition, 'name'>;
export type TColumnCreatorOptions<T> = {
  [K in keyof Required<T>]: TColumnDefinitionNameless;
};
