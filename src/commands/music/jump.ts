/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Command } from '@sapphire/framework';
import { useQueue } from 'discord-player';

export class JumpCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      description:
        'Jumps to the given track without removing any previous tracks',
    });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) => {
      builder //
        .setName(this.name)
        .setDescription(this.description)
        .addIntegerOption((option) =>
          option
            .setName('track')
            .setDescription('The track you want to jump to')
            .setMinValue(1)
            .setRequired(true)
            .setAutocomplete(true)
        );
    });
  }

  public override async autocompleteRun(
    interaction: Command.AutocompleteInteraction
  ) {
    const queue = useQueue(interaction.guild!.id);
    const track = interaction.options.getInteger('track');
    const jump = queue?.tracks.at(track!);
    const position = queue?.node.getTrackPosition(jump!);

    const tracks = queue!.tracks.map((t, index) => ({
      name: t.title,
      value: ++index,
    }));

    if (jump?.title && !tracks.some((t) => t.name === jump.title)) {
      tracks.unshift({
        name: jump.title,
        value: position!,
      });
    }

    let slicedTracks = tracks.slice(0, 5);
    if (track) {
      slicedTracks = tracks.slice(track - 1, track + 4);
      if (slicedTracks.length > 5) {
        slicedTracks = slicedTracks.slice(0, 5);
      }
    }

    return interaction.respond(slicedTracks);
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
    if (!queue.tracks)
      return interaction.reply({
        content: `${emojis.error} | There are **no tracks** to **jump** to`,
        ephemeral: true,
      });
    if (permissions.clientToMember)
      return interaction.reply({
        content: permissions.clientToMember,
        ephemeral: true,
      });

    const jump = interaction.options.getInteger('track')! - 1;
    const trackResolvable = queue.tracks.at(jump);

    if (!trackResolvable)
      return interaction.reply({
        content: `${emojis.error} | The **requested track** doesn't **exist**`,
        ephemeral: true,
      });

    queue.node.jump(trackResolvable);
    return interaction.reply({
      content: `⏩ | I have **jumped** to the track: **${trackResolvable.title}**`,
    });
  }
}
