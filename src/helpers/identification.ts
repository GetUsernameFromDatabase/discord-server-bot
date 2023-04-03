import type { Identification } from '@/indentification';
import { envParseArray } from '@skyra/env-utilities';
import type { CustomClient } from '../custom-client';

export const ID: Identification = {} as Identification; // FILL LATER

export const Update = {
  async Maintainer(client: CustomClient) {
    const mainOwner = envParseArray('OWNERS')[0];
    try {
      ID.Maintainer = await client.users.fetch(mainOwner);
      return ID.Maintainer;
    } catch (error) {
      return console.error(error);
    }
  },
};
