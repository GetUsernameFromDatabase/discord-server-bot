import { Similarity } from './TextManipulation.js';

export const prefix = '€';
/** Minimum similarity with other commands:
 * - If less than this, then it's suggested to just use the help command */
const minSim = 0.3;

class Commands {
  constructor(commands = [], description = '', header = '') {
    this.commands = commands;
    this.description = description;
    this.header = header;

    this.callouts = Array.from(commands.map((x) => x.cmd));
  }

  static MakeCommand(
    cmd,
    response = function () {},
    description = '',
    parameters = Commands.Parameters()
  ) {
    return {
      cmd: prefix + cmd,
      response,
      description,
      parameters,

      name: cmd,
    };
  }

  static Parameters(usage = '', permissions = [], allowedRoles = []) {
    // Permissions: https://discord.com/developers/docs/topics/permissions
    // eslint-disable-next-line no-param-reassign
    allowedRoles =
      typeof permissions === 'string' ? new Array(allowedRoles) : allowedRoles;

    // eslint-disable-next-line no-param-reassign
    permissions =
      typeof permissions === 'string' ? new Array(permissions) : permissions;

    const object = {
      usage,
      permissions,
      allowed_roles: allowedRoles,
    };
    return object;
  }
}

const HelpCMD = Commands.MakeCommand('help');

const publicCommands = [];
// eslint-disable-next-line no-unused-vars
const privateCommands = [];

/**
 * Gets a response for a wrong command
 * @param {Discord.Message} msg Message to respond to
 * @returns {String} The response for the message
 */
export function WrongCommand(msg) {
  const suggestion =
    'I do not recognize this command\nDid you mean to write: `';
  const noIdea = `Write \`${HelpCMD.cmd}\` to know what commands are available`;

  // Finds how similar the message is to all commands
  const predictions = {};
  publicCommands.forEach((x) => {
    const chance = Similarity(x.cmd, msg);
    predictions[chance] = x.cmd;
  });

  const maxChance = predictions.keys().reduce((a, b) => Math.max(a, b));

  const response =
    maxChance >= minSim ? `${suggestion + predictions[maxChance]}\`` : noIdea;

  return response;
}
