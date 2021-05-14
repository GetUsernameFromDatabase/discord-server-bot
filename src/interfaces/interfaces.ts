import { PermissionFlags } from 'discord.js';

export interface CommandObject {
  name: String,
  description: String,
  category: String,
  aliases: String[],
  usage: String,
  guildOnly: true,
  permissions: PermissionFlags,
  cooldown: Number,
};