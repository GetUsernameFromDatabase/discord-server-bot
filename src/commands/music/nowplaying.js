import { GuildMember } from 'discord.js';
import { categories } from '../Commands.js';

export default {
  name: 'nowplaying',
  description: 'Get the song that is currently playing.',
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
    const progress = queue.createProgressBar();
    const perc = queue.getPlayerTimestamp();

    return interaction.followUp({
      embeds: [
        {
          title: 'Now Playing',
          description: `🎶 | **${queue.current.title}**! (\`${perc.progress}%\`)`,
          fields: [
            {
              name: '\u200B',
              value: progress,
            },
          ],
          // eslint-disable-next-line prettier/prettier
          color: 0xFF_FF_FF,
        },
      ],
    });
  },
};
