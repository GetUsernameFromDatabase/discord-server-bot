import { categories } from '../Commands.js';

export default {
  name: 'shuffle',
  description: 'Shuffle the queue',
  category: categories.Music,
  /**
   * @param {import('discord.js').Message} message
   * @param {String[]} args */
  // eslint-disable-next-line consistent-return
  async execute(message) {
    const { client, guild, channel } = message;
    /** @type {import('../../CustomClient').default} */
    const { player } = client;

    /** @type {import('discord-player').Player.queue} */
    const queue = await player.createQueue(guild, {
      metadata: channel,
    });
    if (!queue || !queue.playing)
      return message.reply({ content: '❌ | No music is being played!' });

    await queue.shuffle();
    message.reply({ content: '🔀 | Queue has been shuffled!' });
  },
};
