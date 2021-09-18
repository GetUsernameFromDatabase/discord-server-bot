import { QueryType } from 'discord-player';
import { GuildMember } from 'discord.js';
import { categories } from '../Commands.js';

export default {
  name: 'play',
  description: 'Play a song in your channel!',
  category: categories.Music,
  options: [
    {
      name: 'query',
      type: 3, // 'STRING' Type
      description: 'The song you want to play',
      required: true,
    },
  ],
  // eslint-disable-next-line consistent-return
  async execute(interaction, player) {
    try {
      if (
        !(interaction.member instanceof GuildMember) ||
        !interaction.member.voice.channel
      ) {
        return interaction.reply({
          content: 'You are not in a voice channel!',
          ephemeral: true,
        });
      }

      if (
        interaction.guild.me.voice.channelId &&
        interaction.member.voice.channelId !==
          interaction.guild.me.voice.channelId
      ) {
        return interaction.reply({
          content: 'You are not in my voice channel!',
          ephemeral: true,
        });
      }

      await interaction.deferReply();

      const query = interaction.options.get('query').value;
      const searchResult = await player
        .search(query, {
          requestedBy: interaction.user,
          searchEngine: QueryType.AUTO,
        })
        .catch(() => {});
      if (!searchResult || searchResult.tracks.length === 0)
        return interaction.followUp({ content: 'No results were found!' });

      const queue = await player.createQueue(interaction.guild, {
        metadata: interaction.channel,
      });

      try {
        if (!queue.connection)
          await queue.connect(interaction.member.voice.channel);
      } catch {
        player.deleteQueue(interaction.guildId);
        return interaction.followUp({
          content: 'Could not join your voice channel!',
        });
      }

      await interaction.followUp({
        content: `⏱ | Loading your ${
          searchResult.playlist ? 'playlist' : 'track'
        }...`,
      });

      if (searchResult.playlist) queue.addTracks(searchResult.tracks);
      else queue.addTrack(searchResult.tracks[0]);

      if (!queue.playing) await queue.play();
    } catch (error) {
      console.log(error);
      interaction.followUp({
        content: `There was an error trying to execute that command: ${error.message}`,
      });
    }
  },
};
