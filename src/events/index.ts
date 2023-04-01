import { DiscordBotEvent } from '@/events.js';
import { client } from '../helpers/identification.js';

const AllEvents: DiscordBotEvent[] = [];

// @index(['./**/*.ts'], (f, _) => {const a = _.pascalCase(f.name); return `import { default as ${a} } from '${f.path}.js';\nAllEvents.push(${a});`})
import { default as Error } from './error.js';
AllEvents.push(Error);
import { default as Ready } from './ready.js';
AllEvents.push(Ready);
// @endindex

export function registerAllEvents() {
  for (const event of AllEvents) {
    client[event.listener](event.event, event.execute);
  }
}
