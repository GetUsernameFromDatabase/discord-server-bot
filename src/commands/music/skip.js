import { isUserInVoiceChannel } from '../../PlayerEvents.js';
import { categories } from '../Commands.js';

export default {
  name: 'skip',
  description: 'Skip a song!',
  category: categories.Music,
  /** @param {import('discord.js').Message} message */
  async execute(message) {
    const { client, guildId } = message;
    if (isUserInVoiceChannel(message)) return;

    /** @type {import('../../CustomClient').default} */
    const { player } = client;
    const queue = player.getQueue(guildId);
    if (!queue || !queue.playing) {
      message.reply({
        content: '❌ | No music is being played!',
      });
      return;
    }

    const currentTrack = queue.current;
    const success = queue.skip();
    message.reply({
      content: success
        ? `✅ | Skipped **${currentTrack}**!`
        : '❌ | Something went wrong!',
    });
  },
};
