import * as Discord from 'discord.js';
import { readdirSync } from 'fs';
import { Similarity } from '../TextManipulation.js';

export const prefix = '€';
export const categories = { Utility: 'Utility', Giveaways: 'Giveaways' };
/** Minimum similarity with other commands:
 * - If less than this, then it's suggested to just use the help command */
const minSim = 0.3;

/** @type {Discord.Collection<String, import('../interfaces/interfaces').CommandObject>} */
export const commands = new Discord.Collection();
export function LoadCommands() {
  commands.clear();
  const cmdPath = './src/commands';
  const promises = [];

  const cmdFolders = readdirSync(cmdPath).filter(
    (folder) => !folder.includes('.')
  );
  cmdFolders.forEach((folder) => {
    const cmdFiles = readdirSync(`${cmdPath}/${folder}`).filter((file) =>
      file.endsWith('.js')
    );
    cmdFiles.forEach((file) => {
      promises.push(import(`${`./${folder}`}/${file}`));
    });
  });

  return Promise.all(promises).then((impPromises) =>
    impPromises.forEach((module) => {
      const cmd = module.default;
      commands.set(cmd.name, cmd);
    })
  );
}

/** Gets the command by it's name or alias
 * @param {String} name
 */
export function GetCommand(name) {
  return (
    commands.get(name) ||
    commands.find((c) => c.aliases && c.aliases.includes(name))
  );
}

/**
 * Gets a response for a wrong command
 * @param {String} msg Message to respond to
 * @returns {String} The response for the message
 */
export function WrongCommand(msg) {
  const suggestion = `I do not recognize this command
  Did you mean to write: \`${prefix}`; // ` = MD Inline code start
  const unsure = `Write \`${prefix}help\` to know what commands are available`;

  // Finds how similar the message is to all commands
  const predictions = {};
  [...commands.keys()].forEach((cmd) => {
    const chance = Similarity(cmd, msg);
    predictions[chance] = cmd;
  });

  const maxChance = Object.keys(predictions).reduce((a, b) => Math.max(a, b));

  const response =
    maxChance >= minSim ? `${suggestion + predictions[maxChance]}\`` : unsure;

  return response;
}
