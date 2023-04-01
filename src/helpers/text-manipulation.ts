/**
 * @param string String to segment
 * @param limit Maximum segment size - DEFAULT: 1024
 */
export function SegmentString(string: string, limit: number = 1024) {
  // https://regex101.com/ I love this site
  const rgx = new RegExp(`[\\s\\S]{1,${limit}}(?<=\\n|$)`, 'g');
  return string.match(rgx);
}

/**
 * This goes by the assumption that credits are at the bottom line
 *
 * @param body String where the credit is
 * @param referenceURL CreditURL
 * @returns Modified body
 */
export function ModifyCredits(body: string, referenceURL: string): string {
  let modifiedBody;
  const credit = body.split('\n').pop() ?? '';
  if (credit.includes(' join our ')) {
    const modifiedCredit = `Information taken from:\n${referenceURL}`;
    modifiedBody = body.replace(credit, modifiedCredit);
  }
  return modifiedBody ?? body;
}
