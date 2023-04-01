import { useHistory } from 'discord-player';
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
      name: 'history',
      description: 'Display the queue history',
      options: [
        {
          name: 'page',
          type: CommandOptionType.INTEGER,
          description: 'Specific page number in queue history',
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
    const pageEnd = -10 * (context.options.page - 1) - 1;
    const pageStart = pageEnd - 10;

    const currentTrack = queue.currentTrack;
    const tracks = useHistory(context.guildID ?? '')
      ?.tracks.toArray()
      .slice(pageStart, pageEnd)
      .reverse()
      .map((m, index) => {
        return `${index + pageEnd * -1}. **${m.title}** ([link](${m.url}))`;
      });
    if (!tracks) return context.sendFollowUp('Server Queue History is empty');

    return void context.sendFollowUp({
      embeds: [
        {
          title: 'Server Queue History',
          description: `${tracks.join('\n')}${
            tracks.length > pageStart * -1
              ? `\n...${tracks.length + pageStart} more track(s)`
              : ''
          }`,
          color: 0xff_00_00,
          fields: [
            {
              name: 'Now Playing',
              value: currentTrack
                ? `🎶 | **${currentTrack.title}** ([link](${currentTrack.url}))`
                : 'nothing',
            },
          ],
        },
      ],
    });
  }
}
