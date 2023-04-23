/**
 * This file I just used to develop new features
 *  without having to start the entire bot
 *
 * COMMON REQUIREMENTS section should cover all coupled requirements
 */
// --- COMMON REQUIREMENTS -----------------------------------------------------
import { resolve } from 'node:path';
import { setup } from '@skyra/env-utilities';
import type { ILogger } from '@sapphire/framework';
globalThis.logger = { ...console, debug: console.info } as unknown as ILogger;
console.log(resolve(__dirname, '..', '.env'));
const DotenvConfigOutput = setup({ path: resolve(__dirname, '..', '.env') });
console.log('DOTENV_CONFIG_OUTPUT:', DotenvConfigOutput, '\n\n');
// -----------------------------------------------------------------------------
// NB!: Custom code must start from here
// eslint-disable-next-line @typescript-eslint/no-empty-function
async function main() {}
void main();
