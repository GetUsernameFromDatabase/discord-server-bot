import { useQueue } from 'discord-player';
import {
  SlashCommand,
  SlashCreator,
  CommandContext,
  CommandOptionType,
} from 'slash-create';

export default class extends SlashCommand {
  constructor(creator: SlashCreator) {
    super(creator, {
      name: 'remove',
      description: 'Remove a specific track',
      options: [
        {
          name: 'track',
          description: 'The number of the track to remove',
          type: CommandOptionType.INTEGER,
          required: true,
        },
      ],

      guildIDs: process.env.DISCORD_GUILD_ID
        ? [process.env.DISCORD_GUILD_ID]
        : undefined,
    });
  }

  async run(context: CommandContext) {
    await context.defer();

    const queue = useQueue(context.guildID ?? '');
    if (!queue)
      return void context.send({
        content: '❌ | No music is being played!',
      });

    const trackIndex = context.options.track - 1;
    const trackName = queue.tracks.at(trackIndex)?.title ?? 'NOT_FOUND';
    queue.removeTrack(trackIndex);

    return context.send({
      content: `❌ | Removed track ${trackName}.`,
    });
  }
}
