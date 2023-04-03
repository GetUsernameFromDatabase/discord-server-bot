import {
  ApplicationCommandRegistries,
  RegisterBehavior,
} from '@sapphire/framework';
import '@sapphire/plugin-api/register';
import '@sapphire/plugin-hmr/register';
import '@sapphire/plugin-logger/register';
import { BooleanString, setup, type ArrayString } from '@skyra/env-utilities';
import { join } from 'node:path';

ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(
  RegisterBehavior.BulkOverwrite
);

const rootDirectory = join(__dirname, '..', '..');
const sourceDirectory = join(rootDirectory, 'src');
setup({ path: join(sourceDirectory, '../.env') });

declare module '@skyra/env-utilities' {
  // eslint-disable-next-line unicorn/prevent-abbreviations
  interface Env {
    OWNERS: ArrayString;
    TEST_CHANNEL_ID: string;
    GIVEAWAYS_CHANNEL_ID: string;
    DISCORD_TOKEN: string;
    DEV: BooleanString;
  }
}
