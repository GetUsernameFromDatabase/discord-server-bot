import { isUserInVoiceChannel } from '../../PlayerEvents.js';
import { filterInt } from '../../TypeCheck.js';
import { categories } from '../Commands.js';

export default {
  name: 'jump',
  description: 'Jumps to a specific track',
  usage: '[trackNumber]',
  category: categories.Music,
  /**
   * @param {import('discord.js').Message} message
   * @param {String[]} args */
  async execute(message, args) {
    const { client, guild, channel } = message;
    if (isUserInVoiceChannel(message)) return;
    /** @type {import('../../CustomClient').default} */
    const { player } = client;

    const queue = await player.createQueue(guild, {
      metadata: channel,
    });
    if (!queue || !queue.playing) {
      message.reply({ content: '❌ | No music is being played!' });
      return;
    }

    if (!filterInt(args[0])) {
      message.reply('This command only accepts integers');
      return;
    }
    const trackIndex = args[0] - 1;
    const trackName = queue.tracks[trackIndex].title;

    queue.jump(trackIndex);
    message.reply({ content: `⏭ | **${trackName}** has jumped the queue!` });
  },
};
