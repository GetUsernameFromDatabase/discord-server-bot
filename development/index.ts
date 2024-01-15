/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
// --- RECCOMMENDED TO KEEP THESE AT ALL TIMES
// use logger
import { ILogger } from '@sapphire/framework';
globalThis.logger = {
  ...console,
  debug: console.info,
  write: console.log,
} as unknown as ILogger;
// use environment variables
import { resolve } from 'node:path';
import { setup } from '@skyra/env-utilities';
import { DB } from '@/database/database';
const DotenvConfigOutput = setup({ path: resolve(__dirname, '..', '.env') });
console.log('DOTENV_CONFIG_OUTPUT:', DotenvConfigOutput, '\n\n');
// --- Start custom code

async function main() {
  DB;
  await new Promise((resolve) => setTimeout(resolve, 10_000));
  return;
}

void main();
