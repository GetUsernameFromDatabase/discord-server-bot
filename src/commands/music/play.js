import { QueryType } from 'discord-player';
import Logging from '../../Logging.js';
import { isUserInVoiceChannel } from '../../PlayerEvents.js';
import { categories } from '../Commands.js';

export default {
  name: 'play',
  aliases: ['p'],
  description: 'Query a song to play in your voice channel',
  category: categories.Music,
  usage: '[query]',
  /**
   * @param {import('discord.js').Message} message
   * @param {String[]} args */
  async execute(message, args) {
    const { client, member, guild, guildId, channel } = message;
    if (isUserInVoiceChannel(message)) return;
    /** @type {import('../../CustomClient').default} */
    const { player } = client;

    const query = args.join(' ');
    const searchResult = await player
      .search(query, {
        requestedBy: member.user,
        searchEngine: QueryType.AUTO,
      })
      .catch((error) => {
        Logging.Warn(error);
      });
    if (!searchResult || searchResult.tracks.length === 0) {
      message.reply({ content: 'No results were found!' });
      return;
    }

    const queue = await player.createQueue(guild, {
      metadata: channel,
      ...player.options,
    });
    try {
      if (!queue.connection) await queue.connect(member.voice.channel);
    } catch {
      player.deleteQueue(guildId);
      message.reply({
        content: 'Could not join your voice channel!',
      });
      return;
    }

    if (searchResult.playlist) queue.addTracks(searchResult.tracks);
    else queue.addTrack(searchResult.tracks[0]);

    if (!queue.playing) await queue.play();
  },
};
