// eslint-disable-next-line import/prefer-default-export
export function filterInt(value) {
  if (/^[+-]?(\d+|Infinity)$/.test(value)) {
    return Number(value);
  }
  return Number.NaN;
}
