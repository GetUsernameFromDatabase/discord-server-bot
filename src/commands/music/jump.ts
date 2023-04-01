import {
  SlashCommand,
  SlashCreator,
  CommandContext,
  CommandOptionType,
} from 'slash-create';
import { client } from '../../helpers/identification.js';

export default class extends SlashCommand {
  constructor(creator: SlashCreator) {
    super(creator, {
      name: 'jump',
      description: 'Jump to a specific track',
      options: [
        {
          name: 'tracks',
          description: 'The number of tracks to skip',
          type: CommandOptionType.INTEGER,
        },
      ],

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

    const trackIndex = context.options.tracks - 1;
    const trackName = queue.tracks.at(trackIndex)?.title ?? 'ERROR';
    queue.node.jump(trackIndex);

    return context.sendFollowUp({
      content: `⏭ | **${trackName}** has jumped the queue!`,
    });
  }
}
