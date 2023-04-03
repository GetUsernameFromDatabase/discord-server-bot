import { envParseString } from '@skyra/env-utilities';
import { REST, Routes } from 'discord.js';

export function deleteAllRestCommands(clientid: string) {
  const rest = new REST({ version: '10' }).setToken(
    envParseString('DISCORD_TOKEN')
  );
  rest
    .put(Routes.applicationGuildCommands(clientid, '571418297938214913'), {
      body: [],
    })
    .then(() => console.log('Successfully deleted all guild commands.'))
    .catch(console.error);

  // for global commands
  rest
    .put(Routes.applicationCommands(clientid), { body: [] })
    .then(() => console.log('Successfully deleted all application commands.'))
    .catch(console.error);
}
