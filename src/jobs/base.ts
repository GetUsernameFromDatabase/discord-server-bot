import { Cron } from '@sapphire/time-utilities';

export abstract class BaseCronJob {
  static cron: Cron = new Cron('0 * * * *');
  timeout?: NodeJS.Timeout;

  protected job() {
    return;
  }

  protected churn() {
    const self = this.constructor as typeof BaseCronJob;
    const next = self.cron.next();
    const now = new Date();

    globalThis.logger.debug(
      `CronJob[${this.constructor.name}]: next job will run at ${next
        .toString()
        .slice(0, 33)}`
    );

    const delta = next.getTime() - now.getTime();
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
