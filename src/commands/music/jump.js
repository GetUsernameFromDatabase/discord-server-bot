import { filterInt } from '../../TypeCheck.js';
import { categories } from '../Commands.js';

export default {
  name: 'jump',
  description: 'Jump to a specific track',
  usage: '[trackNumber]',
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
    const trackIndex = args[0] - 1;
    const trackName = queue.tracks[trackIndex].title;

    queue.jump(trackIndex);
    message.reply({ content: `⏭ | **${trackName}** has jumped the queue!` });
  },
};
