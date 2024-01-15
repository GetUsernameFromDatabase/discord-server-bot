import { LogLevel } from '@sapphire/framework';
import { Cron } from '@sapphire/time-utilities';

export abstract class BaseCronJob {
  static cron: Cron = new Cron('0 * * * *');
  timeout?: NodeJS.Timeout;

  protected job() {
    return;
  }

  protected get logHeader() {
    return `CronJob[${this.constructor.name}]`;
  }

  protected log(message: string, logLevel: LogLevel = LogLevel.Info) {
    const formattedMessage = `${this.logHeader}: ${message}`;
    // might look weird if console is globalThis.logger
    return globalThis.logger.write(logLevel, formattedMessage);
  }

  protected churn() {
    const self = this.constructor as typeof BaseCronJob;
    const now = new Date();
    const next = self.cron.next(now);
    const delta = next.getTime() - now.getTime();

    this.log(`next job will run at ${next.toString().slice(0, 33)}`);
    return setTimeout(() => {
      this.job();
      this.churn();
    }, delta);
  }

  start() {
    this.timeout = this.churn();
  }

  stop() {
    if (!this.timeout) return;
    clearTimeout(this.timeout);
  }
}
