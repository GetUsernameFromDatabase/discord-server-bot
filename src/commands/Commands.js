import { Collection } from 'discord.js';
import { Similarity } from '../TextManipulation.js';
import { GetFolders, GetImportsFromFolders } from '../DynamicImport.js';

export const prefix = '€';
export const categories = {
  Utility: '🧰 Utility 🧰',
  Giveaways: '🎁 Giveaways 🎁',
};

// TODO: Make it possible to reload commands on runtime (so far :[ )
/** @type {Collection<String, import('../interfaces/commands').CommandObject>} */
export const commands = new Collection();
export function LoadCommands() {
  commands.clear();
  const promises = GetImportsFromFolders(GetFolders('./src/commands'));
  return Promise.all(promises).then((impPromises) =>
    impPromises.forEach((module) => {
      /** @type {import('../interfaces/commands').CommandObject} */
      const cmd = module.default;
      commands.set(cmd.name, cmd);
    })
  );
}

/** Gets the command by it's name or alias
 * @param {String} name */
export function GetCommand(name) {
  return (
    commands.get(name) ||
    commands.find((c) => c.aliases && c.aliases.includes(name))
  );
}

/** Gets a response for a wrong command
 * @param {String} msg Message to respond to
 * @return {[Number, String[]]} An array: **[0]** = *maximum chance*,
 * **[1]** = *predictions* */
export function GetMostSimilarCommands(msg) {
  // Finds how similar the message is to all commands
  const predictions = [...commands.keys()]
    .map((cmd) => {
      const chance = Similarity(msg, cmd);
      /** @type {[Number, String]} */
      const entry = [chance, cmd];
      return entry;
    })
    .sort(([key1], [key2]) => key1 - key2);
  // Gets predictions with the highest chance
  const maxPred = predictions[predictions.length - 1][0];
  const maxPreds = predictions
    .filter(([key]) => key === maxPred)
    .map(([, cmd]) => cmd);
  return [maxPred, maxPreds];
}

/** Joins predictions into string seperated with ` or ${prefix}`
 * Which is wrapped in MD Inline code
 * @param {String[]} predictions */
export function PredictionsAsString(predictions) {
  return `\`${prefix + predictions.join(` or ${prefix}`)}\``;
}
