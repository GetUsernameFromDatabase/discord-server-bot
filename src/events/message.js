import Logging from '../Logging.js';
import { CheckArgLength } from '../Messaging.js';
import {
  prefix,
  commands,
  GetCommand,
  GetMostSimilarCommands,
  PredictionsAsString,
} from '../commands/Commands.js';

export default {
  name: 'message',
  /** @param {import('discord.js').Message} msg */
  // eslint-disable-next-line consistent-return
  execute(msg) {
    if (msg.content[0] === prefix) {
      const args = msg.content.slice(prefix.length).trim().split(/ +/);
      const cmdName = args.shift().toLowerCase();
      const chan = msg.channel;

      // Finds the command
      /** @type {import('../interfaces/commands').CommandObject} */
      const cmd = GetCommand(cmdName);
      if (!cmd) {
        const [chance, predictions] = GetMostSimilarCommands(cmdName);
        const response =
          chance >= 0.3
            ? `I do not recognize this command
        Did you mean to write${PredictionsAsString(predictions)}`
            : `Write \`${prefix}help\` to know what commands are available`;
        return chan.send(response);
      }

      // Checks if the command should be executed
      if (cmd.guildOnly && chan.type === 'dm')
        return msg.reply("This command won't be executed inside DMs!");
      if (cmd.permissions) {
        const authorPerms = chan.permissionsFor(msg.author);
        if (!authorPerms || !authorPerms.has(cmd.permissions))
          return msg.reply("You don't have permissions for that!");
      }
      const argLenCheck = CheckArgLength(args, cmd.usage);
      if (argLenCheck) return msg.reply(argLenCheck);

      // Executes the command
      try {
        commands.get(cmd.name).execute(msg, args);
      } catch (error) {
        Logging.Error(error);
        msg.reply('Command could not be executed :(');
      }
    }
  },
};
