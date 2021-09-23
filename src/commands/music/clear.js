import { categories } from '../Commands.js';

export default {
  name: 'clear',
  description: 'Clear the current queue',
  category: categories.Music,
  /**
   * @param {import('discord.js').Message} message
   * @param {String[]} args */
  // eslint-disable-next-line consistent-return
  async execute(message) {
    const { client, guild, channel } = message;
    /** @type {import('../../CustomClient').default} */
    const { player } = client;

    const queue = await player.createQueue(guild, {
      metadata: channel,
    });
    if (!queue)
      return message.reply({ content: '❌ | No music in the queue!' });

    queue.clear();
    message.reply({ content: '❌ | Queue cleared.' });
  },
};
