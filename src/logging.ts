import { Client } from 'discord.js';

/** Makes converting from ms to min more readable */
export const minInMs = 60_000;

// TODO: Start using winston https://github.com/winstonjs/winston
export default {
  /** @param {import("discord.js").Client} client */
  Greet: (client: Client) => {
    console.log(`Logged in as ${client.user?.tag ?? 'NOT_FOUND'}!`);
  },

  /** @param {boolean} spacer [true] adds a spacer after logging if true */
  Error: (error: Error | string, description = '', spacer: boolean = true) => {
    console.error(description, error, spacer ? '\n' : '');
  },

  /** @param {boolean} spacer [true] adds a spacer after logging if true */
  Warn: (error: Error, description = '', spacer: boolean = true) => {
    console.warn(description, error, spacer ? '\n' : '');
  },

  Log: (message: string) => {
    console.log(message);
  },
};
