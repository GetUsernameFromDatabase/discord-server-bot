import type { TConflictClause } from './columns';
import type { TDateFunctions } from './date-and-time';

export interface TInsertOptions {
  or?: TConflictClause;
  onConflictUpdate?: boolean;
}

export interface TCreateUpdateOnTriggerOptions {
  triggerName: string;
  dateFunction: TDateFunctions;
}
