import { client } from './Identification.js';
import Logging, { minInMs } from './Logging.js';
import { prefix } from './commands/Commands.js';

/**
 * @param {String} name Name of the activity displayed
 * @param {Number} duration How long activity is displayed in min\
 * if it's 0, then the duration will be calculated based on str.length
 * @param {import('discord.js').ActivityType} type [PLAYING]
 * @param {Boolean} repeat If the Activity is supposed to be after a certain interval
 */
function MakeAct(name, duration = 1, type = 'PLAYING', repeat = false) {
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

  activities = [
    MakeAct(`${prefix}help`, 1.1, 'WATCHING', true),
    MakeAct('with my vodka bottle'),
    MakeAct('𝔀𝓲𝓽𝓱 𝓯𝓵𝓸𝔀𝓮𝓻𝓼'),
    MakeAct(' ʍıʇɥ ɹǝɐlıʇʎ'),
    MakeAct("Jesus Christ, that's a pretty face", 0),
  ];

  constructor() {
    // Repeats activities that should
    const nonRepAct = [];
    const repAct = this.activities.filter((x) => {
      if (x.several === true) return true;
      nonRepAct.push(x);
      return false;
    });
    this.activities = [];

    const raI = 3; // Interval of repetitive activities
    for (let i = 0; i < nonRepAct.length; i++) {
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

    // eslint-disable-next-line unicorn/prefer-prototype-methods
    setTimeout(this.ChangeActivity.bind(this), activity.duration * minInMs);
  }
}
