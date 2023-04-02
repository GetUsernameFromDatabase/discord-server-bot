import { useQueue } from 'discord-player';
import {
  SlashCommand,
  SlashCreator,
  CommandContext,
  CommandOptionType,
} from 'slash-create';
import { GetMessageEmbed } from '../../client/messaging.js';

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
    const queue = useQueue(context.guildID ?? '');
    if (!queue || !queue.node.isPlaying())
      return void context.send({
        content: '❌ | No music is being played!',
      });

    if (!context.options.page) context.options.page = 1;
    const pageStart = 10 * (context.options.page - 1);
    const pageEnd = pageStart + 10;

    const currentTrack = queue.currentTrack;
    const tracks = queue.tracks
      .toArray()
      .slice(pageStart, pageEnd)
      .map(
        (m, index) =>
          `${index + pageStart + 1}. **${m.title}** ([link](${m.url}))`
      );
    const messageEmbed = GetMessageEmbed(
      [
        {
          name: 'Now Playing',
          value: currentTrack
            ? `🎶 | **${currentTrack.title}** ([link](${currentTrack.url}))`
            : 'Nothing',
        },
      ],
      { title: 'Server Queue' }
    ).toJSON();
    messageEmbed.description = `${tracks.join('\n')}${
      tracks.length > pageEnd
        ? `\n...${tracks.length - pageEnd} more track(s)`
        : ''
    }`;

    return void context.send({
      embeds: [messageEmbed],
    });
  }
}
