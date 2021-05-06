const { client } = require("./Identification");
const { Logging } = require("./Logging");

class BotActivity {
  constructor() {
    // Makes activities that should repeat repeat
    for (
      let i = 0;
      i < Math.floor(this.activities.length / this.ratf - 0.5);
      i++
    ) {
      const index = (i + 1) * this.ratf + i;

      const repActvts = Array.from(
        this.activities.filter((x) => x.several === true)
      );
      repActvts.forEach((x) => {
        this.activities.splice(index, 0, x);
      });
    }
    // Starts iterating through activities
    this.ChangeActivity(this);
  }

  SongLyricInterval = 0.5;

  ratf = 3; // Dictates how many other activities have to between repetitive ones

  iteration = 0; // Current activity index

  static MakeActObj(name, duration = 1, type = "PLAYING", several = false) {
    if (!Number.isFinite(duration)) {
      Logging.Error(`Wrong duration inserted into${this.MakeActObj}\n
      Name associated with the wrong input: "${name}"`);
    }
    return {
      name,
      duration,
      type,
      several,
    };
  }

  activities = [
    BotActivity.MakeActObj(
      "How I'm disassembled and reassembled differently",
      1.1,
      "WATCHING",
      true
    ),
    BotActivity.MakeActObj("with my vodka bottle"),
    BotActivity.MakeActObj("𝔀𝓲𝓽𝓱 𝓯𝓵𝓸𝔀𝓮𝓻𝓼"),
    BotActivity.MakeActObj(" ʍıʇɥ ɹǝɐlıʇʎ"),
    BotActivity.MakeActObj(
      "Jesus Christ, that's a pretty face",
      this.SongLyricInterval
    ),
  ];

  /* eslint-disable class-methods-use-this */
  ChangeActivity(ActivityClass) {
    const cls = ActivityClass;
    const activity = ActivityClass.activities[cls.iteration];

    client.user.setActivity(activity.name, {
      type: activity.type,
    });

    cls.iteration += 1;
    if (cls.iteration >= cls.activities.length) {
      cls.iteration = 0;
    }

    setTimeout(cls.ChangeActivity, activity.duration * 60 * 1000, cls);
  }
}
exports.BotActivity = BotActivity;
