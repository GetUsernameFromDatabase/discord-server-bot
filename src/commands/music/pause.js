import { GuildMember } from 'discord.js';
import { categories } from '../Commands.js';

export default {
  name: 'pause',
  description: 'Pause current song!',
  category: categories.Music,
  /** @param {import('discord.js').Message} message */
  async execute(message) {
    const { client, member, guild, guildId } = message;
    /** @type {import('../../CustomClient').default} */
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
    const success = queue.setPaused(true);
    return message.reply({
      content: success ? '⏸ | Paused!' : '❌ | Something went wrong!',
    });
  },
};
