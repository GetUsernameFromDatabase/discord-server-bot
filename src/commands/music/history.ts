/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { PaginatedMessage } from '@sapphire/discord.js-utilities';
import { Command } from '@sapphire/framework';
import { useHistory, useQueue } from 'discord-player';

export class HistoryCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      description: 'Displays the queue history in an embed',
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
    const history = useHistory(interaction.guild!.id);

    if (!queue)
      return interaction.reply({
        content: `${emojis.error} | I am **not** in a voice channel`,
        ephemeral: true,
      });
    if (!history?.tracks)
      return interaction.reply({
        content: `${emojis.error} | There is **no** queue history to **display**`,
        ephemeral: true,
      });

    let pagesNumber = Math.ceil(queue.tracks.size / 5);

    if (pagesNumber <= 0) {
      pagesNumber = 1;
    }

    const tracks = history.tracks.map(
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
            `**Queue history** for **session** in **${
              queue.channel?.name ?? 'NO_CHANNEL'
            }:**\n${list === '' ? '\n*• No more queued tracks*' : `\n${list}`}
						\n`
          )
          .setFooter({
            text: `${queue.tracks.size} track(s) in queue`,
          })
      );
    }

    return paginatedMessage.run(interaction);
  }
}
