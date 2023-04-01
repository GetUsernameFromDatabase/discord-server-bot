import { GatewayIntentBits } from 'discord.js';
import Logging from '../logging.js';
import DiscordBot from '../client/custom-client.js';
import { PersonalUse } from '@/indentification.js';

const intents = [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.GuildVoiceStates,
  GatewayIntentBits.MessageContent,
];

export const client = new DiscordBot({ intents });
export const ID: PersonalUse = {} as PersonalUse; // FILL LATER

export const Update = {
  Maintainer() {
    return client.users
      .fetch('186439588229677056')
      .then((user) => {
        ID.Maintainer = user;
        return user;
      })
      .catch(Logging.Error);
  },

  Server(ServerID = process.env.DISCORD_GUILD_ID) {
    if (!ServerID) throw new Error('ServerID must be defined');
    return client.guilds
      .fetch(ServerID)
      .then((server) => {
        ID.Server = server;
        return server;
      })
      .catch(Logging.Error);
  },
};
