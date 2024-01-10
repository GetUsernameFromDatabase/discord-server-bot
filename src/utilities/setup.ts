import {
  ApplicationCommandRegistries,
  RegisterBehavior,
} from '@sapphire/framework';
import '@sapphire/plugin-api/register';
import '@sapphire/plugin-hmr/register';
import '@sapphire/plugin-logger/register';
import { BooleanString, setup, type ArrayString } from '@skyra/env-utilities';
import { resolve } from 'node:path';

ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(
  RegisterBehavior.BulkOverwrite
);
export default setup({ path: resolve(__dirname, '../..', '.env') });

declare module '@skyra/env-utilities' {
  // eslint-disable-next-line unicorn/prevent-abbreviations
  interface Env {
    OWNERS: ArrayString;
    DISCORD_TOKEN: string;
    DEV: BooleanString;
  }
}
