import { LogLevel } from '@sapphire/framework';

export type TGiveawayStatus = {
  log_message: string;
  log_level: LogLevel;
};
export type TGiveawayStatuses = Record<GiveawayStatusEnum, TGiveawayStatus>;
export enum GiveawayStatusEnum {
  SUCCESS = 'SUCCESS',
  NONE_FOUND = 'NONE_FOUND',
  NO_NEW = 'NO_NEW',
  FAILED_TO_SEND = 'FAILED_TO_SEND',
}

export class GiveawayStatus {
  static enum = GiveawayStatusEnum;
  static statusInformation: Readonly<TGiveawayStatuses> = {
    SUCCESS: {
      log_message: 'Giveaways successfully sent',
      log_level: LogLevel.Info,
    },
    NONE_FOUND: {
      log_message: 'No giveaways were found',
      log_level: LogLevel.Error,
    },
    NO_NEW: {
      log_message: 'No new giveaways',
      log_level: LogLevel.Info,
    },
    FAILED_TO_SEND: {
      log_message: 'Failed to send giveaways',
      log_level: LogLevel.Error,
    },
  };

  static isGiveawayStatusEnum(value: unknown): value is GiveawayStatusEnum {
    return typeof value === 'string' && value in GiveawayStatusEnum;
  }

  static logGiveawayFetchResult(giveawayStatus: GiveawayStatusEnum) {
    const { log_level, log_message } = this.statusInformation[giveawayStatus];

    if (log_level >= LogLevel.Error) {
      globalThis.logger.error(new Error(log_message));
    } else if (log_level >= LogLevel.Info) {
      globalThis.logger.info(log_message);
    }
    return giveawayStatus;
  }

  // --- static part ends
  status: GiveawayStatusEnum;
  constructor(status: GiveawayStatusEnum, logOnCreate: boolean = false) {
    this.status = status;

    if (logOnCreate) {
      this.logGiveawayStatusResult();
    }
  }

  logGiveawayStatusResult() {
    return GiveawayStatus.logGiveawayFetchResult(this.status);
  }

  get statusInformation() {
    return GiveawayStatus.statusInformation[this.status];
  }
}
