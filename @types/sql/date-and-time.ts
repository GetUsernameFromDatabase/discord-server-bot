/**
 * {@link https://sqlite.org/lang_datefunc.html}
 */

/**
 * **DATE**: YYYY-MM-DD
 *
 * **TIME**:
 * - HH:MM
 * - HH:MM:SS
 * - HH:MM:SS.SSS
 *
 * **DATETIME**:
 * - `DATE` `TIME`
 * - `DATE`T`TIME`
 *
 * **Literals**:
 * - now
 * - DDDDDDDDDD -- unixepoch
 */
export type TTimeValue = string | 'now' | number;

export type TDateModifier =
  | 'NNN days'
  | 'NNN hours'
  | 'NNN minutes'
  | 'NNN.NNNN seconds'
  | 'NNN months'
  | 'NNN years'
  | 'start of month'
  | 'start of year'
  | 'start of day'
  | 'weekday N'
  | 'unixepoch'
  | 'julianday'
  | 'auto'
  | 'localtime'
  | 'utc';

export type TDateFunction = (
  timeValue: TTimeValue,
  ...modifiers: TDateModifier[]
) => string;

export type TDateFunctions =
  | 'date'
  | 'time'
  | 'datetime'
  | 'julianday'
  | 'unixepoch';
