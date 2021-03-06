import Logging, { minInMs } from '../Logging.js';
import { prefix } from '../commands/Commands.js';
import { client } from '../helpers/Identification.js';

/**
 * @param {String} name Name of the activity displayed
 * @param {Number} duration How long activity is displayed in min\
 * if it's 0, then the duration will be calculated based on str.length
 * @param {import('discord.js').ActivityType} type [PLAYING]
 * @param {Boolean} repeat If the Activity is supposed to be after a certain interval
 */
export function CreateActivity(
  name,
  duration = 1,
  type = 'PLAYING',
  repeat = false
) {
  if (!Number.isFinite(duration) || duration < 0) {
    Logging.Error(`Wrong duration (${duration}) inserted into${this.MakeActObj}\n
      Name associated with the wrong input: "${name}"\nDuration replaced with the default`);
    // eslint-disable-next-line no-param-reassign
    duration = 1;
  } else if (duration === 0) {
    // eslint-disable-next-line no-param-reassign
    duration = name.length / 60;
  }
  return {
    name,
    duration,
    type: type.toUpperCase(),
    several: repeat,
  };
}

export default class BotActivity {
  iteration = 0; // Current activity index

  constructor(
    activities = [CreateActivity(`${prefix}help`, 1.5, 'WATCHING', true)]
  ) {
    // Repeats activities that should
    const nonRepAct = [];
    const repAct = activities.filter((x) => {
      if (x.several === true) return true;
      nonRepAct.push(x);
      return false;
    });
    this.activities = [];

    const raI = 3; // Interval of repetitive activities
    for (let i = 0, n = nonRepAct.length; i < n; i++) {
      if (i % (raI - 1) === 0) this.activities.push(...repAct);
      this.activities.push(nonRepAct[i]);
    }
    // Starts iterating through activities
    this.ChangeActivity();
  }

  ChangeActivity() {
    const activity = this.activities[this.iteration];

    client.user.setActivity(activity.name, {
      type: activity.type,
    });
    this.iteration += 1;
    if (this.iteration >= this.activities.length) this.iteration = 0;

    setTimeout(this.ChangeActivity.bind(this), activity.duration * minInMs);
  }
}
