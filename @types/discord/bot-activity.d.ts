import { ActivityOptions } from 'discord.js';

export interface CustomBotActivity {
  name: string;
  duration: number;
  type: ActivityOptions['type'];
  several: boolean;
}
