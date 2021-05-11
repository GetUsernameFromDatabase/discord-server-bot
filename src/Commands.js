export const prefix = '€';

export default class Commands {
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
