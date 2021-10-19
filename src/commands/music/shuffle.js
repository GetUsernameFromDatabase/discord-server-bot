import { isUserInVoiceChannel } from '../../PlayerEvents.js';
import { categories } from '../Commands.js';

export default {
  name: 'shuffle',
  description: 'Shuffles the queue',
  category: categories.Music,
  /**
   * @param {import('discord.js').Message} message
   * @param {String[]} args */
  async execute(message) {
    const { client, guild, channel } = message;
    /** @type {import('../../CustomClient').default} */
    const { player } = client;

    if (isUserInVoiceChannel(message)) return;

    /** @type {import('discord-player').Player.queue} */
    const queue = await player.createQueue(guild, {
      metadata: channel,
    });
    if (!queue || !queue.playing) {
      message.reply({ content: '❌ | No music is being played!' });
      return;
    }

    await queue.shuffle();
    message.reply({ content: '🔀 | Queue has been shuffled!' });
  },
};
