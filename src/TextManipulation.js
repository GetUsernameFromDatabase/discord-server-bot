class TextManipulation {
  static ReplacerAll(base, replacee, replacement = '') {
    return base.split(replacee).join(replacement);
  }

  static Similarity(s1 = '', s2 = '') {
    let longer = s1.length >= s2.length ? s1 : s2;
    let shorter = s1 === longer ? s2 : s1;

    if (longer.length === 0) {
      return 1.0;
    }

    longer = longer.toLowerCase();
    shorter = shorter.toLowerCase();

    let editDist = longer.length - TextManipulation.editDistance(longer, shorter);
    return editDist / parseFloat(longer.length);
  }

  static editDistance(longer, shorter) {
    let costs = [];
    for (let i = 0; i <= longer.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= shorter.length; j++) {
        if (i === 0) { costs[j] = j; } else if (j > 0) {
          let newValue = costs[j - 1];
          if (longer.charAt(i - 1) !== shorter.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) { costs[shorter.length] = lastValue; }
    }
    return costs[shorter.length];
  }
}
exports.TextManipulation = TextManipulation;
