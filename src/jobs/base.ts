import type { Cron } from '@sapphire/time-utilities';

export abstract class BaseCronJob {
  cron: Cron;
  constructor(cron: Cron) {
    this.cron = cron;
    this.churner();
  }

  protected job() {
    return;
  }

  protected churner() {
    const next = this.cron.next();
    const now = new Date();
    const delta = next.getTime() - now.getTime();

    globalThis.logger.debug(
      `Next ${this.constructor.name} job will run at ${next
        .toString()
        .slice(0, 33)}`
    );

    setTimeout(() => {
      this.job();
      this.churner();
    }, delta);
  }
}
