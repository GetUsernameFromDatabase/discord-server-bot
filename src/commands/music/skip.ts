import { Command } from '@sapphire/framework';
import { useQueue } from 'discord-player';

export class SkipCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      description: 'Skips the current track and automatically plays the next',
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
    const { emojis, voice } = this.container.client.utils;
    const queue = useQueue(interaction.guild!.id);
    const permissions = voice(interaction);

    if (!queue)
      return interaction.reply({
        content: `${emojis.error} | I am **not** in a voice channel`,
        ephemeral: true,
      });
    if (!queue.currentTrack)
      return interaction.reply({
        content: `${emojis.error} | There is no track **currently** playing`,
        ephemeral: true,
      });

    if (permissions.clientToMember)
      return interaction.reply({
        content: permissions.clientToMember,
        ephemeral: true,
      });

    queue.node.skip();
    return interaction.reply({
      content: `⏩ | I have **skipped** to the next track`,
    });
  }
}
