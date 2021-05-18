/* eslint-disable no-console */
// TODO: Start using winston https://github.com/winstonjs/winston
/** Makes converting from ms to min more readable */
export const minInMs = 60_000;
export default {
  /** @param {import("discord.js").Client} client */
  Greet(client) {
    console.log(`Logged in as ${client.user.tag}!`);
  },

  /** @param {Boolean} spacer [true] adds a spacer after logging if true */
  Error(err, description = '', spacer = true) {
    if (description !== '') console.error(description, err);
    else console.error(err);

    if (spacer) console.error('\n');
  },

  Log(msg) {
    console.log(msg);
  },
};
