import { PaginatedMessage } from '@sapphire/discord.js-utilities';
import { Command } from '@sapphire/framework';
import { useQueue } from 'discord-player';

export class QueueCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      description: 'Displays the queue in an embed',
    });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) => {
      builder //
        .setName(this.name)
        .setDescription(this.description);
    });
  }

  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ) {
    const { emojis } = this.container.client.utils;
    const queue = useQueue(interaction.guild!.id);

    if (!queue)
      return interaction.reply({
        content: `${emojis.error} | I am **not** in a voice channel`,
        ephemeral: true,
      });
    if (!queue.tracks || !queue.currentTrack)
      return interaction.reply({
        content: `${emojis.error} | There is **no** queue to **display**`,
        ephemeral: true,
      });

    let pagesNumber = Math.ceil(queue.tracks.size / 5);
    if (pagesNumber <= 0) pagesNumber = 1;

    const tracks = queue.tracks.map(
      (track, index) => `**${++index})** [${track.title}](${track.url})`
    );
    const paginatedMessage = new PaginatedMessage();

    // handle error if pages exceed 25 pages
    if (pagesNumber > 25) pagesNumber = 25;
    for (let index = 0; index < pagesNumber; index++) {
      const list = tracks.slice(index * 5, index * 5 + 5).join('\n');

      paginatedMessage.addPageEmbed((embed) =>
        embed
          .setColor('Red')
          .setDescription(
            `**Queue** for **session** in **${
              queue.channel?.name ?? 'ERROR'
            }:**\n${list === '' ? '\n*• No more queued tracks*' : `\n${list}`}
						\n**Now Playing:** [${queue.currentTrack?.title ?? 'NOTHING'}](${
              queue.currentTrack?.url ?? ''
            })\n`
          )
          .setFooter({
            text: `${queue.tracks.size} track(s) in queue`,
          })
      );
    }

    return paginatedMessage.run(interaction);
  }
}
