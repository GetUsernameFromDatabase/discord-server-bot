export function filterInt(value) {
  if (/^[+-]?(\d+|Infinity)$/.test(value)) {
    return Number(value);
  }
  return Number.NaN;
}

/** Checks if input is an array of strings or strings
 * @param {String | String[] | import('discord.js').EmbedField |
 *  import('discord.js').EmbedField[]} toCheck
 * @returns true if 'toCheck' is an array of string or string
 */
export function CheckStringArray(toCheck) {
  const bool =
    (Array.isArray(toCheck) && typeof toCheck[0] === 'string') ||
    typeof toCheck === 'string';
  return bool;
}
