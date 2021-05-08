/* eslint-disable no-console */
class Logging {
  /**
   * @param {import("discord.js").Client} client The bot
   */
  static Greet(client) {
    console.log(`Logged in as ${client.user.tag}!`);
  }

  /**
   * @param {Boolean} spacer To add a spacer after logging error
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
