import { Similarity } from '../TextManipulation.js';
import { GetFolders, GetImportsFromFolders } from '../helpers/DynamicImport.js';
import { client } from '../helpers/Identification.js';

export const prefix = '€';
export const categories = {
  Utility: '🧰 Utility 🧰',
  Giveaways: '🎁 Giveaways 🎁',
  Music: '🎵 Music 🎵',
};

// TODO: Make it possible to reload commands on runtime (so far :[ )
/** @type {Collection<String, import('../interfaces/commands').CommandObject>} */
export function LoadCommands() {
  client.commands.clear();
  const promises = GetImportsFromFolders(GetFolders('./src/commands'));
  return Promise.all(promises).then((impPromises) => {
    for (const module of impPromises) {
      /** @type {import('../interfaces/commands').CommandObject} */
      const cmd = module.default;
      client.commands.set(cmd.name, cmd);
    }
  });
}

/** Gets the command by it's name or alias
 * @param {String} name */
export function GetCommand(name) {
  return (
    client.commands.get(name) ||
    client.commands.find((c) => c.aliases && c.aliases.includes(name))
  );
}

/**
 * @param {String} base
 * @param {String} comparison
 * @returns {[Number, String]} */
function getPrediction(base, comparison) {
  const chance = Similarity(base, comparison);
  return [chance, comparison];
}

/** Gets a response for a wrong command
 * @param {String} msg Message to respond to
 * @return {[Number, String[]]} An array: **[0]** = *maximum chance*,
 * **[1]** = *predictions* */
export function GetMostSimilarCommands(msg) {
  // Finds how similar the message is to all commands
  const cmdPredictions = [...client.commands.keys()].map((cmd) =>
    getPrediction(msg, cmd)
  );
  /** @type {[Number, String][]} */
  const aliasPredictions = [];
  for (const [, cmdName] of cmdPredictions) {
    /** @type {import('../interfaces/commands').CommandObject} */
    const cmd = client.commands.get(cmdName);
    if (!cmd.aliases) continue;
    aliasPredictions.push(
      ...cmd.aliases.map((alias) => getPrediction(msg, alias))
    );
  }

  const predictions = [...cmdPredictions, ...aliasPredictions].sort(
    ([key1], [key2]) => key1 - key2
  );
  // Gets predictions with the highest chance - works since sorted
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
