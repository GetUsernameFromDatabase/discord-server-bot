import { ActivityType, ActivityOptions } from 'discord.js';
import type { CustomBotActivity } from '@/discord/bot-activity.js';
import type { CustomClient } from './custom-client';
import { Time } from '@sapphire/duration';

/**
 * @param {string} name Name of the activity displayed
 * @param {number} duration How long activity is displayed in min\
 * if it's 0, then the duration will be calculated based on str.length
 * @param {ActivityType} type
 * @param {boolean} repeat If the Activity is supposed to be after a certain interval
 */
export function CreateActivity(
  name: string,
  duration: number = 1,
  type: ActivityOptions['type'] = ActivityType.Playing,
  repeat: boolean = false
) {
  if (!Number.isFinite(duration) || duration < 0) {
    const error =
      new Error(`Wrong duration (${duration}) inserted into Activity Creator\n
      Name associated with the wrong input: "${name}"\nDuration replaced with the default`);
    globalThis.logger.warn(error);
    // eslint-disable-next-line no-param-reassign
    duration = 1;
  } else if (duration === 0) {
    // eslint-disable-next-line no-param-reassign
    duration = name.length / 60;
  }
  return { name, duration, type, several: repeat };
}

export default class BotActivity {
  iteration = 0; // Current activity index
  activities: CustomBotActivity[];
  client: CustomClient;

  constructor(client: CustomClient, activities: CustomBotActivity[] = []) {
    this.client = client;
    // Repeats activities that should
    const nonRepAct: CustomBotActivity[] = [];
    const repAct: CustomBotActivity[] = activities.filter((x) => {
      if (x.several === true) return true;
      nonRepAct.push(x);
      return false;
    });
    this.activities = [];

    const raI = 3; // Interval of repetitive activities
    for (let index = 0, n = nonRepAct.length; index < n; index++) {
      if (index % (raI - 1) === 0) this.activities.push(...repAct);
      this.activities.push(nonRepAct[index]);
    }
    // Starts iterating through activities
    this.ChangeActivity();
  }

  ChangeActivity() {
    const activity = this.activities[this.iteration];

    this.client.user?.setActivity(activity.name, {
      type: activity.type,
    });
    this.iteration += 1;
    if (this.iteration >= this.activities.length) this.iteration = 0;

    setTimeout(this.ChangeActivity.bind(this), activity.duration * Time.Minute);
  }
}
