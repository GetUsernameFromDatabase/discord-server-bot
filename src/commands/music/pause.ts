import { SlashCommand, SlashCreator, CommandContext } from 'slash-create';
import { client } from '../../helpers/identification.js';

export default class extends SlashCommand {
  constructor(creator: SlashCreator) {
    super(creator, {
      name: 'pause',
      description: 'Pause the current song',

      guildIDs: process.env.DISCORD_GUILD_ID
        ? [process.env.DISCORD_GUILD_ID]
        : undefined,
    });
  }

  async run(context: CommandContext) {
    await context.defer();

    const queue = client.player.nodes.get(context.guildID ?? '');
    if (!queue || !queue.node.isPlaying())
      return void context.sendFollowUp({
        content: '❌ | No music is being played!',
      });
    const paused = queue.node.setPaused(true);
    return void context.sendFollowUp({
      content: paused ? '⏸ | Paused!' : '❌ | Something went wrong!',
    });
  }
}
