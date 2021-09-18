import { GuildMember } from 'discord.js';
import { categories } from '../Commands.js';

export default {
  name: 'resume',
  description: 'Resume current song!',
  category: categories.Music,
  async execute(interaction, player) {
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
    const queue = player.getQueue(interaction.guildId);
    if (!queue || !queue.playing)
      return interaction.followUp({
        content: '❌ | No music is being played!',
      });
    const success = queue.setPaused(false);
    return interaction.followUp({
      content: success ? '▶ | Resumed!' : '❌ | Something went wrong!',
    });
  },
};
