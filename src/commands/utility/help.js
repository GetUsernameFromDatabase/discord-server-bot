// https://discordjs.guide/command-handling/adding-features.html#a-dynamic-help-command
import { MessageEmbed } from 'discord.js';
import { client } from '../../Identification.js';
import { GetMsgEmbed } from '../../Messaging.js';
import {
  prefix,
  categories,
  GetCommand,
  GetMostSimilarCommands,
  PredictionsAsString,
} from '../Commands.js';

/** Takes in an array which will be used to make an EmbedField for discord
 * @param {[String, String]} array [0]-name ; [1]-value
 * @param {Boolean} inline =[true], if inline EmbedField or not
 */
function MakeEmbedFields(array, inline = true) {
  return array.map(([k, v]) => MessageEmbed.normalizeField(k, v, inline));
}

/** Gets a MessageEmbed of all commands with a category\
 * Commands with the same category will shown in the same field */
function HelpForAllCommands() {
  const CmdCat = {};
  for (const [key, value] of client.commands.entries()) {
    if (typeof value.category === 'string') {
      const whatWasBefore = CmdCat[value.category];
      CmdCat[value.category] = `${whatWasBefore || ''}•${key}\n`;
    }
  }
  const embedFields = MakeEmbedFields(Object.entries(CmdCat));
  return GetMsgEmbed(embedFields, { title: 'All of my commands' });
}

/** Gets a MessageEmbed of a command with descriptions\
 * @param {import('../../interfaces/commands').CommandObject} command
 * parameters that will be shown:
 * - aliases
 * - description
 * - usage
 * - cooldown
 */
function HelpForCommand(command) {
  const wantedParameters = ['aliases', 'description', 'usage', 'cooldown'];
  const filteredParameters = Object.entries(command).filter(([key]) =>
    wantedParameters.includes(key)
  );
  const proccesedEntries = filteredParameters.map(([key, val]) => {
    // Deals with different parameters
    switch (key) {
      case wantedParameters[0]: // Since aliases is String[]
        return [key, val.join(', ')];
      case wantedParameters[2]: // Since usage has only args
        return [key, `${prefix + command.name} ${val}`];
      case wantedParameters[3]: // Cooldown doesn't have time format
        return [key, `${val} seconds`];
      default:
        return [key, val];
    }
  });
  const embedFields = MakeEmbedFields(proccesedEntries, false);
  return GetMsgEmbed(embedFields, { title: prefix + command.name });
}

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
  async execute(message, args) {
    const chan = message.channel;
    // If no arguments were supplied sends all usable commands
    if (args.length === 0) {
      const embeds = [HelpForAllCommands(chan)];
      return chan.send({ embeds });
    }

    // Gets the command that the user wants to know about
    const arg = args[0].toLowerCase();
    const cmd = GetCommand(arg);
    if (!cmd) {
      const [, predictions] = GetMostSimilarCommands(arg);
      return message.reply(
        `did you want to know about ${PredictionsAsString(predictions)}?`
      );
    }
    const embeds = [HelpForCommand(cmd)];
    return chan.send({ embeds });
  },
};
