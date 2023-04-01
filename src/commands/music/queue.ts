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
      name: 'queue',
      description: 'See the queue',
      options: [
        {
          name: 'page',
          type: CommandOptionType.INTEGER,
          description: 'Specific page number in queue',
          required: false,
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

    if (!context.options.page) context.options.page = 1;
    const pageStart = 10 * (context.options.page - 1);
    const pageEnd = pageStart + 10;

    const currentTrack = queue.currentTrack;
    const tracks = queue.tracks
      .toArray()
      .slice(pageStart, pageEnd)
      .map((m, index) => {
        return `${index + pageStart + 1}. **${m.title}** ([link](${m.url}))`;
      });
    const nowPlayingInfo = currentTrack
      ? `🎶 | **${currentTrack.title}** ([link](${currentTrack.url}))`
      : 'Nothing';

    return void context.sendFollowUp({
      embeds: [
        {
          title: 'Server Queue',
          description: `${tracks.join('\n')}${
            tracks.length > pageEnd
              ? `\n...${tracks.length - pageEnd} more track(s)`
              : ''
          }`,
          color: 0xff_00_00,
          fields: [
            {
              name: 'Now Playing',
              value: nowPlayingInfo,
            },
          ],
        },
      ],
    });
  }
}
