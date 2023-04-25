type AcceptedArray = (string | number | symbol)[];

export function getSelectPart(chosenValues?: AcceptedArray) {
  return chosenValues?.join(', ') ?? '*';
}

/**
 * Gets parts usable for queries -- convenience function
 * TODO: make efficient -- cut out the parts not needed
 */
export function getQueryParts(values?: object | 'ALL'): {
  bindings: { [key: string]: unknown };
  wherePart: string[];
  columnPart: string;
  valuePart: string;
  setPart: string;
} {
  const bindings: { [key: string]: unknown } = {};
  const wherePart: string[] = [];
  if (!values || typeof values === 'string') {
    return {
      bindings,
      wherePart,
      columnPart: '',
      valuePart: '',
      setPart: '',
    };
  }

  const columnPart = [];
  const valuePart = [];
  const setPart = [];

  for (const [key, value] of Object.entries(values)) {
    bindings[`$${key}`] = value;
    wherePart.push(`${key} = $${key}`);
    columnPart.push(key);
    valuePart.push(`$${key}`);
    const setValue = typeof value === 'string' ? `"${value}"` : String(value);
    setPart.push(`${key} = ${setValue}`);
  }

  /** Comma Seperated Join */
  const csj = ', ';
  return {
    bindings,
    wherePart,
    columnPart: columnPart.join(csj),
    valuePart: valuePart.join(csj),
    setPart: setPart.join(csj),
  };
}
