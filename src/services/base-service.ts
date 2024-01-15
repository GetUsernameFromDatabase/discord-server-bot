import { LogLevel } from '@sapphire/framework';

export abstract class BaseService {
  protected get logHeader() {
    return `Service[${this.constructor.name}]`;
  }
  protected log(message: string, logLevel: LogLevel = LogLevel.Info) {
    const formattedMessage = `${this.logHeader}: ${message}`;
    globalThis.logger.write(logLevel, formattedMessage);
  }
}
