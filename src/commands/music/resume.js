import { isUserInVoiceChannel } from '../../client/PlayerEvents.js';
import { categories } from '../Commands.js';

export default {
  name: 'resume',
  description: 'Resume a paused song',
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

    const success = queue.setPaused(false);
    message.reply({
      content: success ? '▶ | Resumed!' : '❌ | Something went wrong!',
    });
  },
};
