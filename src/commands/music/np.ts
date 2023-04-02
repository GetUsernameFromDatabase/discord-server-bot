import { useQueue } from 'discord-player';
import { SlashCommand, SlashCreator, CommandContext } from 'slash-create';

export default class extends SlashCommand {
  constructor(creator: SlashCreator) {
    super(creator, {
      name: 'np',
      description: "See what's currently being played",

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
    const progress = queue.node.createProgressBar();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const perc = queue.node.getTimestamp()!;

    const progressInfo = Number.isFinite(perc.progress)
      ? perc.progress.toString() + '%'
      : 'Live';
    const trackTitle = queue.currentTrack?.title ?? 'NOT_FOUND';

    return void context.send({
      embeds: [
        {
          title: 'Now Playing',
          description: `🎶 | **${trackTitle}**! (\`${progressInfo}\`)`,
          fields: [
            {
              name: '\u200B',
              value: progress?.replace(/ 0:00/g, ' ◉ LIVE') ?? 'ERROR',
            },
          ],
          color: 0xff_ff_ff,
        },
      ],
    });
  }
}
