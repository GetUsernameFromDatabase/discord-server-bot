import { SlashCommand, SlashCreator, CommandContext } from 'slash-create';

import { client } from '../../helpers/identification.js';

export default class extends SlashCommand {
  constructor(creator: SlashCreator) {
    super(creator, {
      name: 'clear',
      description: 'Clear the current queue.',

      guildIDs: process.env.DISCORD_GUILD_ID
        ? [process.env.DISCORD_GUILD_ID]
        : undefined,
    });
  }

  async run(context: CommandContext) {
    await context.defer();

    const queue = client.player.nodes.get(context.guildID ?? '');
    if (!queue)
      return void context.sendFollowUp({
        content: '❌ | No music in the queue!',
      });

    queue.clear();

    return context.sendFollowUp({ content: '❌ | Queue cleared.' });
  }
}
