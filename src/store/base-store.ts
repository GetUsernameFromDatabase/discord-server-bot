import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

export abstract class BaseStore<T> {
  readonly location: string;
  readonly encoding: BufferEncoding;
  /**
   * JSON.stringify replacer parameter
   * {@link JSON.stringify}
   */
  constructor(location: string, encoding: BufferEncoding = 'utf8') {
    if (!location.endsWith('.json'))
      throw new Error('Only JSON store files are allowed');
    this.location = path.resolve(location);
    this.encoding = encoding;
  }

  update(data: T) {
    writeFileSync(
      this.location,
      JSON.stringify(data, undefined, 2),
      this.encoding
    );
    globalThis.logger.debug(`Updated ${this.location}`);
  }

  read() {
    if (!existsSync(this.location)) {
      globalThis.logger.warn(`Store file does not exist: ${this.location}`);
      return;
    }
    const fileContent = readFileSync(this.location, this.encoding);
    return JSON.parse(fileContent) as T;
  }
}
