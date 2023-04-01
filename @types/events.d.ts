import { ClientEvents } from 'discord.js';

export type EventListeners = 'on' | 'once';
export type ClientEventKeys = keyof ClientEvents;

export interface DiscordBotEvent {
  listener: EventListeners;
  event: ClientEventKeys;
  execute: (...parameters) => void | Promise<void>;
}
