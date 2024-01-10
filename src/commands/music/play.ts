import { Command } from '@sapphire/framework';
import { useMasterPlayer } from 'discord-player';
import type { GuildMember } from 'discord.js';

export class PlayCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      description: 'Plays and enqueues track(s) of the query provided',
    });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) => {
      builder //
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption((option) => {
          return option
            .setName('query')
            .setDescription('A query of your choice')
            .setRequired(true)
            .setAutocomplete(true);
        });
    });
  }

  public override async autocompleteRun(
    interaction: Command.AutocompleteInteraction
  ) {
    const player = useMasterPlayer()!;
    const query = interaction.options.getString('query');
    const results = await player.search(query!);

    let tracks;
    tracks = results.tracks
      .map((t) => ({
        name: t.title,
        value: t.url,
      }))
      .slice(0, 5);

    if (results.playlist) {
      tracks = results.tracks
        .map(() => ({
          name: `${results.playlist!.title} [playlist]`,
          value: results.playlist!.url,
        }))
        .slice(0, 1);
    }

    return interaction.respond(tracks);
  }

  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ) {
    const { emojis, voice, options } = this.container.client.utils;
    const player = useMasterPlayer()!;
    const permissions = voice(interaction);
    const query = interaction.options.getString('query')!;
    const member = interaction.member as GuildMember;

    if (permissions.member)
      return interaction.reply({
        content: permissions.member,
        ephemeral: true,
      });
    if (permissions.client)
      return interaction.reply({
        content: permissions.client,
        ephemeral: true,
      });
    if (permissions.clientToMember)
      return interaction.reply({
        content: permissions.clientToMember,
        ephemeral: true,
      });

    const results = await player.search(query);
    if (!results.hasTracks())
      return interaction.reply({
        content: `${emojis.error} | **No** tracks were found for your query`,
        ephemeral: true,
      });

    await interaction.deferReply();

    try {
      const response = await player.play(member.voice.channel!.id, results, {
        nodeOptions: options(interaction),
      });
      return interaction.editReply({
        content: `${emojis.success} | Successfully enqueued${
          response.track.playlist
            ? ` **track(s)** from: **${response.track.playlist.title}**`
            : `: **${response.track.title}**`
        }`,
      });
    } catch (error) {
      await interaction.editReply({
        content: `${emojis.error} | An **error** has occurred`,
      });
      return globalThis.logger.error(error);
    }
  }
}
