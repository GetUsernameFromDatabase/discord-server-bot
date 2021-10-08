import { isUserInVoiceChannel } from '../../PlayerEvents.js';
import { categories } from '../Commands.js';

export default {
  name: 'clear',
  description: 'Clear the current queue',
  category: categories.Music,
  /**
   * @param {import('discord.js').Message} message
   * @param {String[]} args */
  async execute(message) {
    const { client, guild, channel } = message;
    if (isUserInVoiceChannel(message)) return;
    /** @type {import('../../CustomClient').default} */
    const { player } = client;

    const queue = await player.createQueue(guild, {
      metadata: channel,
    });
    if (!queue) {
      message.reply({ content: '❌ | No music in the queue!' });
      return;
    }

    queue.clear();
    message.reply({ content: '❌ | Queue cleared.' });
  },
};
