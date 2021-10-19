import { isUserInVoiceChannel } from '../../PlayerEvents.js';
import { filterInt } from '../../TypeCheck.js';
import { categories } from '../Commands.js';

export default {
  name: 'seek',
  description: 'Seek to the given time',
  usage: '[timeInSeconds]',
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

    const arg = args[0];
    if (!filterInt(arg)) {
      message.reply('This command only accepts integers');
      return;
    }
    const time = arg * 1000;

    await queue.seek(time);
    message.reply({ content: `✅ | Seeked to ${time / 1000} seconds` });
  },
};
