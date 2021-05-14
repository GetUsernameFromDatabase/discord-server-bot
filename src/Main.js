/* eslint-disable import/prefer-default-export */
import Logging from './Logging.js';
import BotActivity from './BotActivity.js';
import Giveaways from './Giveaways.js';
import { Update, client } from './Identification.js';
import {
  prefix,
  WrongCommand,
  LoadCommands,
  commands,
  GetCommand,
} from './commands/Commands.js';
// eslint-disable-next-line no-unused-vars
import { CheckArgLength } from './Messaging.js';

/** @type {{Giveaways: Giveaways}} */
export const handlers = {};

client.login(process.env.TOKEN);

client.once('ready', async () => {
  await Update.Maintainer(); // Gets my up to date user data
  await Update.Server(); // Gets my server
  Logging.Greet(client);

  // BOT FUNCTION INITIATIONS OR STARTING REQUIREMENTS
  handlers.BotActivity = new BotActivity();
  handlers.Giveaways = new Giveaways();
  await LoadCommands();
});

// eslint-disable-next-line consistent-return
client.on('message', (msg) => {
  if (msg.content[0] === prefix) {
    const args = msg.content.slice(prefix.length).trim().split(/ +/);
    const cmdName = args.shift().toLowerCase();
    const chan = msg.channel;

    // Finds the command
    /** @type {import('./interfaces/interfaces').CommandObject} */
    const cmd = GetCommand(cmdName);
    if (!cmd) return chan.send(WrongCommand(msg.content));

    // Checks if the command should be used
    if (cmd.guildOnly && chan.type === 'dm')
      return msg.reply("This command won't be executed inside DMs!");
    if (cmd.permissions) {
      const authorPerms = chan.permissionsFor(msg.author);
      if (!authorPerms || !authorPerms.has(cmd.permissions))
        return msg.reply("You don't have permissions to do that!");
    }
    const argLenCheck = CheckArgLength(args, cmd.usage);
    if (argLenCheck) return msg.reply(argLenCheck);
    // TODO: Have cooldowns for commands

    // Executes the command
    try {
      commands.get(cmd.name).execute(msg, args);
    } catch (error) {
      Logging.Error(error);
      msg.reply('Command could not be executed :(');
    }
  }
});

client.on('disconnect', () => {
  Logging.Error('Bot has disconnected!');
});

client.on('error', Logging.Error);
