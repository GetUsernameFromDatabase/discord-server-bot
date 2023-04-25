import type { Identification } from '@/discord/indentification';
import { envParseArray } from '@skyra/env-utilities';
import type { CustomClient } from '../custom-client';

export const ID: Identification = {} as Identification; // FILL LATER

export const Update = {
  async Maintainer(client: CustomClient) {
    const mainOwner = envParseArray('OWNERS')[0];
    const { logger } = globalThis;

    try {
      ID.Maintainer = await client.users.fetch(mainOwner);
      const { username, discriminator } = ID.Maintainer;
      logger.info(`Maintainer changed to ${username}#${discriminator}`);
      return ID.Maintainer;
    } catch (error) {
      return logger.error(error);
    }
  },
};
