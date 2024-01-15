// https://stackoverflow.com/a/61108377
export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;
export type PartialPick<T, F extends keyof T> = Omit<T, F> &
  Partial<Pick<T, F>>;
export type PickByKeys<T, K extends keyof T> = {
  [P in K]: T[P];
};
export type PickByKeysOrFull<T, K extends keyof T> = PickByKeys<T, K> | T;
