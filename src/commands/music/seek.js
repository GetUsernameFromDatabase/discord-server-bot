import Logging from '../../Logging.js';
import { filterInt } from '../../TypeCheck.js';
import { isUserInVoiceChannel } from '../../client/PlayerEvents.js';
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

    try {
      await queue.seek(time);
    } catch (error) {
      message.reply({ content: `❌ | Seeking failed :(` });
      Logging.Error(error);
      return;
    }

    message.reply({ content: `✅ | Seeked to ${time / 1000} seconds` });
  },
};
