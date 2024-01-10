/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Command } from '@sapphire/framework';
import { QueueRepeatMode, useQueue } from 'discord-player';

const repeatModes = [
  { name: 'Off', value: QueueRepeatMode.OFF },
  { name: 'Track', value: QueueRepeatMode.TRACK },
  { name: 'Queue', value: QueueRepeatMode.QUEUE },
  { name: 'Autoplay', value: QueueRepeatMode.AUTOPLAY },
];

export class LoopCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      description: 'Loops the current playing track or the entire queue',
    });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) => {
      builder //
        .setName(this.name)
        .setDescription(this.description)
        .addNumberOption((option) =>
          option
            .setName('mode')
            .setDescription('Choose a loop mode')
            .setRequired(true)
            .addChoices(...repeatModes)
        );
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

    const mode = interaction.options.getNumber('mode', true) as QueueRepeatMode;
    const name =
      mode === QueueRepeatMode.OFF
        ? 'Looping'
        : repeatModes.find((m) => m.value === mode)?.name;
    if (!name)
      return interaction.reply(
        `${emojis.error} | Error occured -- loop mode not found`
      );

    queue.setRepeatMode(mode);

    return interaction.reply({
      content: `${emojis.success} | **${name}** has been **${
        mode === queue.repeatMode ? 'enabled' : 'disabled'
      }**`,
    });
  }
}
