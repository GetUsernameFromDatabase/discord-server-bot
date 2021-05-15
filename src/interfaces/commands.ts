import { ObjectMethod } from '@babel/types';
import { PermissionFlags } from 'discord.js';

export interface CommandObject {
  name: String,
  aliases?: String[],

  category?: String,
  description: String,

  usage: String,
  cooldown?: Number,

  guildOnly?: true,
  permissions?: PermissionFlags,
  
  execute: ObjectMethod
};