import { GetMsgEmbed, blank } from '../../Messaging.js';
import { categories } from '../Commands.js';

export default {
  name: 'nowplaying',
  aliases: ['np'],
  description: 'Get the song that is currently playing',
  category: categories.Music,
  /** @param {import('discord.js').Message} message */
  async execute(message) {
    const { client, guildId } = message;
    /** @type {import('../../CustomClient').default} */
    const { player } = client;

    const queue = player.getQueue(guildId);
    if (!queue || !queue.playing)
      return message.reply({
        content: '❌ | No music is being played!',
      });
    const progress = queue.createProgressBar();
    const perc = queue.getPlayerTimestamp();

    const msgEmbed = GetMsgEmbed(
      [
        {
          name: blank,
          value: progress,
        },
      ],
      { title: 'Now Playing', url: queue.current.url }
    );
    msgEmbed.description = `🎶 | **${queue.current.title}**! (\`${perc.progress}%\`)`;
    return message.reply({
      embeds: [msgEmbed],
    });
  },
};
