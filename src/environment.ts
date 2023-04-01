import { RequiredEnvironmentVariablesKeys } from '@/environment.js';
import * as dotenv from 'dotenv'; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import

const requiredEnvironmentVariables: RequiredEnvironmentVariablesKeys[] = [
  'DISCORD_CLIENT_ID',
  'DISCORD_CLIENT_PUBKEY',
  'DISCORD_CLIENT_TOKEN',
  'DISCORD_GUILD_ID',
  'GIVEAWAYS_CHANNEL_ID',
  'TEST_CHANNEL_ID',
];

/**
 * Checks and imports dotenv environment
 */
export function checkEnvironment() {
  const config = dotenv.config();
  if (!config.parsed) throw new Error("Couldn't parse environment variables");
  if (Object.keys(config.parsed).length < requiredEnvironmentVariables.length)
    throw new Error('Not enough environment variables');

  const missingEnvironmentVariables = requiredEnvironmentVariables.filter(
    (x) => !process.env[x]
  );
  if (missingEnvironmentVariables.length > 0) {
    const missingArrayAsString = missingEnvironmentVariables.join(', ');
    throw new Error(`Missing environment variables: [${missingArrayAsString}]`);
  }
}
