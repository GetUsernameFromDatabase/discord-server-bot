import { filterInt } from '../../TypeCheck.js';
import { categories } from '../Commands.js';

export default {
  name: 'seek',
  description: 'Seek to the given time',
  usage: '[time]',
  category: categories.Music,
  /**
   * @param {import('discord.js').Message} message
   * @param {String[]} args */
  // eslint-disable-next-line consistent-return
  async execute(message, args) {
    const { client, guild, channel } = message;
    /** @type {import('../../CustomClient').default} */
    const { player } = client;

    const queue = await player.createQueue(guild, {
      metadata: channel,
    });
    if (!queue || !queue.playing)
      return message.reply({ content: '❌ | No music is being played!' });

    if (!filterInt(args[0]))
      return message.reply('This command only accepts integers');
    const time = args[0] * 1000;

    await queue.seek(time);
    message.reply({ content: `✅ | Seeked to ${time / 1000} seconds` });
  },
};
