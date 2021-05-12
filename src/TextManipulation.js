/**
 * @param {String} string String to segment
 * @param {Number} [limit] Maximum segment size - DEFAULT: 1024
 * @returns {RegExpMatchArray} Segmented string
 */
export function SegmentString(string, limit = 1024) {
  // https://stackoverflow.com/questions/6259515/how-can-i-split-a-string-into-segments-of-n-characters
  // https://regex101.com/ I love this site
  const rgx = new RegExp(`[\\s\\S]{1,${limit}}(?<=\\n|$)`, 'g');
  return string.match(rgx);
}

/**
 * How many edits need to be done to make the shorter string be the same as the longer one
 * @param {String} longer The longer string
 * @param {String} shorter The shorter string
 * @returns {Number} Integer - how many edits need to be done
 */
function editDistance(longer, shorter) {
  const costs = [];
  for (let i = 0; i <= longer.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= shorter.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (longer.charAt(i - 1) !== shorter.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) {
      costs[shorter.length] = lastValue;
    }
  }
  return costs[shorter.length];
}

/**
 * Checks how similar strings are
 * @param {String} s1 One string
 * @param {String} s2 Second string
 * @returns {Number} How similar they are - from 0 till 1
 */
export function Similarity(s1, s2) {
  let longer = s1.length >= s2.length ? s1 : s2;
  let shorter = s1 === longer ? s2 : s1;

  if (longer.length === 0) {
    return 1.0;
  }

  longer = longer.toLowerCase();
  shorter = shorter.toLowerCase();

  const editDist = longer.length - editDistance(longer, shorter);
  return editDist / parseFloat(longer.length);
}

/** This goes by the assumption that credits are at the bottom line
 * @param {String} body String where the credit is
 * @param {String} referenceURL CreditURL
 * @returns {String} Modified body
 */
export function ModifyCredits(body, referenceURL) {
  let newBody = null;
  const credit = body.split('\n').pop();
  if (credit.includes(' join our ')) {
    const newCredit = `Information taken from:\n${referenceURL}`;
    newBody = body.replace(credit, newCredit);
  }
  return newBody ?? body;
}
