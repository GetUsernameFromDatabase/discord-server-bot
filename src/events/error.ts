import { DiscordBotEvent } from '@/events.js';
import logging from '../logging.js';

export default {
  listener: 'on',
  event: 'error',
  execute: logging.Error,
} as DiscordBotEvent;
