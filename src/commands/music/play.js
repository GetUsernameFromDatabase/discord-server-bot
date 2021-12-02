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
      ...player.options, // leaveOnEnd is different without it
      metadata: channel,
      // eslint-disable-next-line consistent-return, no-unused-vars
      async onBeforeCreateStream(track, source, _queue) {
        const { title, url, author } = track;
        const playDlSearchOpt = {
          fuzzy: true,
        };

        let songURL = url;
        // since SpotifyBridge is not working for me
        if (url.includes('spotify.')) {
          const srchRslt = await playdl.search(
            `${title} ${author}`,
            playDlSearchOpt
          );
          songURL = srchRslt[0]?.url;
        }
        if (source === 'youtube' && songURL) {
          const streamer = await playdl.stream(songURL);
          return streamer.stream;
        }
      },
    });
    // In order to change existing queue channel on command use
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
