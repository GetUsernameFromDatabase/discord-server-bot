/* eslint-disable no-console */
/** Makes converting from ms to min more readable */
export const minInMs = 60_000;

// TODO: Start using winston https://github.com/winstonjs/winston
export default {
  /** @param {import("discord.js").Client} client */
  Greet(client) {
    console.log(`Logged in as ${client.user.tag}!`);
  },

  /** @param {Boolean} spacer [true] adds a spacer after logging if true */
  Error(err, description = '', spacer = true) {
    console.error(description, err, spacer ? '\n' : '');
  },

  /** @param {Boolean} spacer [true] adds a spacer after logging if true */
  Warn(err, description = '', spacer = true) {
    console.warn(description, err, spacer ? '\n' : '');
  },

  Log(msg) {
    console.log(msg);
  },
};
