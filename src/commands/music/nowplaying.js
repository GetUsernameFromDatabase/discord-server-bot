import { GuildMember } from 'discord.js';
import { categories } from '../Commands.js';

export default {
  name: 'nowplaying',
  description: 'Get the song that is currently playing.',
  category: categories.Music,
  /** @param {import('discord.js').Message} message */
  async execute(message) {
    const { client, member, guild, guildId } = message;
    /** @type {import('../../Identification').DiscordBot} */
    const { player } = client;

    if (!(member instanceof GuildMember) || !member.voice.channel) {
      return message.reply({
        content: 'You are not in a voice channel!',
        ephemeral: true,
      });
    }

    if (
      guild.me.voice.channelId &&
      member.voice.channelId !== guild.me.voice.channelId
    ) {
      return message.reply({
        content: 'You are not in my voice channel!',
        ephemeral: true,
      });
    }

    const queue = player.getQueue(guildId);
    if (!queue || !queue.playing)
      return message.reply({
        content: '❌ | No music is being played!',
      });
    const progress = queue.createProgressBar();
    const perc = queue.getPlayerTimestamp();

    return message.reply({
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
