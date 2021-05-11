import { client } from './Identification.js';
import Logging from './Logging.js';

export default class BotActivity {
  iteration = 0; // Current activity index

  activities = [
    BotActivity.MakeActObj(
      "How I'm disassembled and reassembled differently",
      1.1,
      'WATCHING',
      true
    ),
    BotActivity.MakeActObj('with my vodka bottle'),
    BotActivity.MakeActObj('𝔀𝓲𝓽𝓱 𝓯𝓵𝓸𝔀𝓮𝓻𝓼'),
    BotActivity.MakeActObj(' ʍıʇɥ ɹǝɐlıʇʎ'),
    BotActivity.MakeActObj("Jesus Christ, that's a pretty face", 0),
  ];

  constructor() {
    // Makes activities that should repeat repeat
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

  /**
   * @param {String} name Name of the activity displayed
   * @param {Number} duration How long activity is displayed in min
   * @param {String} type [PLAYING], WATCHING
   * @param {Boolean} repeat If the Activity is supposed to be after a certain interval
   */
  static MakeActObj(name, duration = 1, type = 'PLAYING', repeat = false) {
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

  ChangeActivity() {
    // Just to make it look prettier in VSC
    const activity = this.activities[this.iteration];

    client.user.setActivity(activity.name, {
      type: activity.type,
    });

    this.iteration += 1;
    if (this.iteration >= this.activities.length) this.iteration = 0;

    setTimeout(
      this.ChangeActivity.bind(this),
      activity.duration * Logging.minInMs
    );
  }
}
