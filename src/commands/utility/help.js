// https://discordjs.guide/command-handling/adding-features.html#a-dynamic-help-command
import { prefix, commands } from '../Commands.js';
import Logging from '../../Logging.js';
// TODO: Make this use MessageEmbeds
export default {
  name: 'help',
  description: 'List all of my commands or info about a specific command.',
  aliases: ['commands'],
  usage: '[command name]',
  cooldown: 5,
  /**
   * @param {import('discord.js').Message} message
   * @param {String[]} args */
  // eslint-disable-next-line consistent-return
  execute(message, args) {
    const data = [];

    if (!args.length) {
      data.push("Here's a list of all my commands:");
      data.push(commands.map((command) => command.name).join(', '));
      data.push(
        `\nYou can send \`${prefix}help [command name]\` to get info on a specific command!`
      );

      return message.author
        .send(data, { split: true })
        .then(() => {
          if (message.channel.type === 'dm') return;
          message.reply("I've sent you a DM with all my commands!");
        })
        .catch((error) => {
          Logging.Error(
            error,
            `Could not send help DM to ${message.author.tag}.\n`
          );
          message.reply(
            "it seems like I can't DM you! Do you have DMs disabled?"
          );
        });
    }
    const name = args[0].toLowerCase();
    const command =
      commands.get(name) ||
      commands.find((c) => c.aliases && c.aliases.includes(name));

    if (!command) {
      return message.reply("that's not a valid command!");
    }

    data.push(`**Name:** ${command.name}`);

    if (command.aliases)
      data.push(`**Aliases:** ${command.aliases.join(', ')}`);
    if (command.description)
      data.push(`**Description:** ${command.description}`);
    if (command.usage)
      data.push(`**Usage:** ${prefix}${command.name} ${command.usage}`);

    data.push(`**Cooldown:** ${command.cooldown || 3} second(s)`);

    message.channel.send(data, { split: true });
  },
};
