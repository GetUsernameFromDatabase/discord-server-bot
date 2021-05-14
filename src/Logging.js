/* eslint-disable no-console */
// TODO: Start using winston https://github.com/winstonjs/winston
export const minInMs = 60000;
export default class Logging {
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
    if (description !== '') console.error(description, err);
    else console.error(err);

    if (spacer) console.error('\n');
  }

  static Log(msg) {
    console.log(msg);
  }
}
