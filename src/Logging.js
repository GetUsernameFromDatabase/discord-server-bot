/* eslint-disable no-console */
class Logging {
  static minInMs = 60 * 1000;

  /**
   * @param {import("discord.js").Client} client The bot
   */
  static Greet(client) {
    console.log(`Logged in as ${client.user.tag}!`);
  }

  /**
   * @param {Boolean} spacer [true] adds a spacer after logging if true
   */
  static Error(err, description = '', spacer = true) {
    if (description !== '') console.error(description);
    console.error(err);
    if (spacer) console.error('\n');
  }

  static Log(msg) {
    console.log(msg);
  }
}
exports.Logging = Logging;
