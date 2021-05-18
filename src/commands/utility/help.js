// https://discordjs.guide/command-handling/adding-features.html#a-dynamic-help-command
import { MessageEmbed } from 'discord.js';
import { GetMsgEmbed } from '../../Messaging.js';
import {
  prefix,
  commands,
  categories,
  GetCommand,
  GetMostSimilarCommands,
  PredictionsAsString,
} from '../Commands.js';

export default {
  name: 'help',
  description: 'List all of my commands or info about a specific command.',
  category: categories.Utility,
  aliases: ['commands'],
  usage: '(command name)',
  cooldown: 5,
  /**
   * @param {import('discord.js').Message} message
   * @param {String[]} args */
  execute(message, args) {
    const chan = message.channel;
    // If no arguments were supplied sends all usable commands
    // eslint-disable-next-line unicorn/explicit-length-check
    if (!args.length) {
      const CmdCat = {};
      for (const [key, value] of commands.entries()) {
        CmdCat[value.category] = `•${CmdCat[value.category] || ''}${key}\n`;
      }

      const embedFields = Object.keys(CmdCat).map((key) =>
        MessageEmbed.normalizeField(key, CmdCat[key], true)
      );
      return chan.send(GetMsgEmbed(embedFields, 'All of my commands'));
    }
    // Gets the command
    const arg = args[0].toLowerCase();
    const cmd = GetCommand(arg);
    if (!cmd) {
      const [, predictions] = GetMostSimilarCommands(arg);
      return message.reply(
        `did you want to know about ${PredictionsAsString(predictions)}?`
      );
    }

    // Gets what command parameters I want to display
    const wantedEntries = ['aliases', 'description', 'usage', 'cooldown'];
    const filteredEntries = Object.entries(cmd)
      .filter(([key]) => wantedEntries.includes(key))
      .map(([key, val]) => {
        switch (key) {
          case wantedEntries[0]: // Since aliases is String[]
            return [key, val.join(', ')];
          case wantedEntries[2]: // Since usage has only args
            return [key, `${prefix + cmd.name} ${val}`];
          case wantedEntries[3]: // Cooldown doesn't have time format
            return [key, `${val} seconds`];
          default:
            return [key, val];
        }
      });

    // Sends the response
    const embedFields = filteredEntries.map(([key, value]) =>
      MessageEmbed.normalizeField(key, value)
    );
    return chan.send(GetMsgEmbed(embedFields, cmd.name));
  },
};
