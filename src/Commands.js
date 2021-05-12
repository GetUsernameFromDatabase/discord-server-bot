import { Similarity } from './TextManipulation.js';

export const prefix = '€';
/*  -
  is used to determine how similar text has to be to a command before it suggests it to the user */
/** Minimum prediction similarity
 *
 */
const mps = 0.3;

const extracted = class Commands {
  static HelpCMD = Commands.MakeCommand('help');

  static ALLCOMMANDS = []; // Placeholder

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

  /**
   * Gets a response for a wrong command
   * @param {Discord.Message} msg Message to respond to
   * @returns {String} The response for the message
   */
  static WrongCommand(msg) {
    const suggestion =
      'I do not recognize this command\nDid you mean to write: `';
    const noIdea = `Write \`${Commands.HelpCMD.cmd}\` to know what commands are available`;

    // Finds how similar the message is to all commands
    const predictions = {};
    Commands.ALLCOMMANDS.forEach((x) => {
      const chance = Similarity(x.cmd, msg);
      predictions[chance] = x.cmd;
    });

    const maxChance = predictions.keys().reduce((a, b) => Math.max(a, b));

    const response =
      maxChance >= mps ? `${suggestion + predictions[maxChance]}\`` : noIdea;

    return response;
  }
};
export default extracted;
