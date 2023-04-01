import { SlashCreator } from 'slash-create';
const AllCommands: unknown[] = [];

// @index(['./**/index.ts'], (f, _) => {const a = _.pascalCase(f.path.split('/')[1]);const b = a + 'Commands'; return `import * as ${a} from '${f.path}.js';\nconst ${b} = Object.values(${a});\nAllCommands.push(...${b});`})
import * as Giveaways from './giveaways/index.js';
const GiveawaysCommands = Object.values(Giveaways);
AllCommands.push(...GiveawaysCommands);
import * as Memes from './memes/index.js';
const MemesCommands = Object.values(Memes);
AllCommands.push(...MemesCommands);
import * as Music from './music/index.js';
const MusicCommands = Object.values(Music);
AllCommands.push(...MusicCommands);
// @endindex

export function registerAllCommands(creator: SlashCreator) {
  creator.registerCommands(AllCommands);
}
