export function rejectAndLog(
  query: string,
  error: Error,
  reject: (reason?: unknown) => void
) {
  logQueryAndError(query, error);
  reject(error);
}

export function logQueryAndError(query: string, error: Error) {
  globalThis.logger.error(error, 'QUERY:', query);
}
