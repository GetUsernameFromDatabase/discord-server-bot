// https://stackoverflow.com/a/61108377
export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;
export type PickByKeys<T, K extends keyof T> = {
  [P in K]: T[P];
};
export type PickByKeysOrFull<T, K extends keyof T | undefined> =
  | PickByKeys<T, K>
  | T;
