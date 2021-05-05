const prefix = '€';

class Commands {
  constructor(commands = [], description = '', header = '') {
    this.commands = commands;
    this.description = description;
    this.header = header;

    this.callouts = Array.from(commands.map(x => {
      return x.cmd;
    }));
  }

  static Command(cmd, response = function () {}, description = '', parameters = Commands.Parameters()) {
    let object = {
      cmd: prefix + cmd,
      response: response,
      description: description,
      parameters: parameters,

      name: cmd
    };
    return object;
  }

  static Parameters(usage = '', permissions = [], allowedRoles = []) {
    // Permissions: https://discord.com/developers/docs/topics/permissions
    // eslint-disable-next-line no-param-reassign
    allowedRoles = typeof (permissions) === typeof ('')
      ? new Array(allowedRoles) : allowedRoles;

    // eslint-disable-next-line no-param-reassign
    permissions = typeof (permissions) === typeof ('')
      ? new Array(permissions) : permissions;

    let object = {
      usage: usage,
      permissions: permissions,
      allowed_roles: allowedRoles
    };
    return object;
  }
}
exports.Commands = Commands;
