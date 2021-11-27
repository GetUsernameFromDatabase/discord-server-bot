import { QueryType } from 'discord-player';
import playdl from 'play-dl';
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
      ...player.options,
      metadata: channel,
      // eslint-disable-next-line consistent-return
      async onBeforeCreateStream(track, source) {
        // only trap youtube source
        const { title, url, author } = track;
        let songURL = url;
        if (source === 'youtube') {
          const exp = /(youtu\.be|youtube\.com)/; // In order to make this hacky solution work
          if (!exp.test(songURL)) {
            const searchResPlayDL = await playdl.search(`${title} ${author}`, {
              fuzzy: true,
            });
            songURL = searchResPlayDL[0]?.url;
          }
          const streamer = await playdl.stream(songURL);
          return streamer.stream;
        }
      },
    });
    queue.metadata = channel;
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
