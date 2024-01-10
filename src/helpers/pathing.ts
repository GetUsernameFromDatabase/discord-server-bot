import path from 'node:path';

/** Resolves from this projects /data path */
export function resolveFromDataPath(path_to: string) {
  return path.resolve(__dirname, '../../data', path_to);
}
