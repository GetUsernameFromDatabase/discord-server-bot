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
} from './commands/Commands.js';
// eslint-disable-next-line no-unused-vars
import { CheckArgLength } from './Messaging.js';

/** @type {{giveaways: Giveaways}} */
export const handlers = {};

client.login(process.env.TOKEN);

client.once('ready', async () => {
  await Update.Maintainer(); // Gets my up to date user data
  await Update.Server(); // Gets my server
  Logging.Greet(client);

  // BOT FUNCTION INITIATIONS OR STARTING REQUIREMENTS
  /* eslint-disable no-new */
  new BotActivity();
  handlers.giveaways = new Giveaways();
  LoadCommands();
  /* eslint-enable no-new */
});

// eslint-disable-next-line consistent-return
client.on('message', (msg) => {
  if (msg.content[0] === prefix) {
    const args = msg.content.slice(prefix.length).trim().split(/ +/);
    const cmdName = args.shift().toLowerCase();

    if (!commands.has(cmdName))
      return msg.channel.send(WrongCommand(msg.content));
    /** @type {import('./interfaces/interfaces').ExampleCommand} */
    const cmd =
      commands.get(cmdName) ||
      commands.find((x) => x.aliases && x.aliases.includes(cmdName));

    if (cmd.guildOnly && msg.channel.type === 'dm')
      return msg.reply("This command won't be executed inside DMs!");
    if (cmd.permissions) {
      const authorPerms = msg.channel.permissionsFor(msg.author);
      if (!authorPerms || !authorPerms.has(cmd.permissions))
        return msg.reply("You don't have permissions to do that!");
    }
    if (CheckArgLength(args, cmd.usage, msg.channel)) return false;
    // TODO: Have cooldowns for commands

    try {
      commands.get(cmdName).execute(msg, args);
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
