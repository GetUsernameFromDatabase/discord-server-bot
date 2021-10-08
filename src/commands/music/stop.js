import { isUserInVoiceChannel } from '../../PlayerEvents.js';
import { categories } from '../Commands.js';

export default {
  name: 'stop',
  description: 'Stop all songs in the queue!',
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

    queue.destroy();
    message.reply({ content: '🛑 | Stopped the player!' });
  },
};
