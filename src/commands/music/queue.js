import { GetMsgEmbed } from '../../Messaging.js';
import { categories } from '../Commands.js';

export default {
  name: 'queue',
  aliases: ['q'],
  description: 'Display the queue',
  usage: '(page)',
  category: categories.Music,
  /**
   * @param {import('discord.js').Message} message
   * @param {String[]} args */
  async execute(message, args) {
    const { client, guild, channel } = message;
    /** @type {import('../../CustomClient').default} */
    const { player } = client;

    const queue = await player.createQueue(guild, {
      metadata: channel,
    });
    if (!queue || !queue.playing)
      return message.reply({
        content: '❌ | No music is being played!',
      });

    let page = args[0];
    if (!page) page = 1;
    const pageStart = 10 * (page - 1);
    const pageEnd = pageStart + 10;

    const currentTrack = queue.current;
    const tracks = queue.tracks.slice(pageStart, pageEnd).map((m, i) => {
      return `${i + pageStart + 1}. **${m.title}** ([link](${m.url}))`;
    });

    const msgEmbed = GetMsgEmbed(
      [
        {
          name: 'Now Playing',
          value: `🎶 | **${currentTrack.title}** ([link](${currentTrack.url}))`,
        },
      ],
      { title: 'Server Queue' }
    );
    msgEmbed.description = `${tracks.join('\n')}${
      queue.tracks.length > pageEnd
        ? `\n...${queue.tracks.length - pageEnd} more track(s)`
        : ''
    }`;
    return message.reply({
      embeds: [msgEmbed],
    });
  },
};
