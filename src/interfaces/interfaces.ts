import { PermissionFlags } from 'discord.js';

export interface ExampleCommand {
  name: String,
  description: String,
  aliases: String[],
  usage: String,
  guildOnly: true,
  permissions: PermissionFlags,
  cooldown: Number,
};