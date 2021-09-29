import { QueryType } from 'discord-player';
import { GuildMember } from 'discord.js';
import Logging from '../../Logging.js';
import { categories } from '../Commands.js';

export default {
  name: 'play',
  aliases: ['p'],
  description: 'Play a song in your channel!',
  category: categories.Music,
  usage: '[query]',
  /**
   * @param {import('discord.js').Message} message
   * @param {String[]} args */
  // eslint-disable-next-line consistent-return
  async execute(message, args) {
    const { client, member, guild, guildId, channel } = message;
    /** @type {import('../../CustomClient').default} */
    const { player } = client;

    try {
      if (!(member instanceof GuildMember) || !member.voice.channel) {
        return message.reply({
          content: 'You are not in a voice channel!',
          ephemeral: true,
        });
      }

      if (
        guild.me.voice.channelId &&
        member.voice.channelId !== guild.me.voice.channelId
      ) {
        return message.reply({
          content: 'You are not in my voice channel!',
          ephemeral: true,
        });
      }

      const query = args.join(' ');
      const searchResult = await player
        .search(query, {
          requestedBy: member.user,
          searchEngine: QueryType.AUTO,
        })
        .catch((error) => {
          Logging.Warn(error);
        });
      if (!searchResult || searchResult.tracks.length === 0)
        return message.reply({ content: 'No results were found!' });

      const queue = await player.createQueue(guild, {
        metadata: channel,
      });

      try {
        if (!queue.connection) await queue.connect(member.voice.channel);
      } catch {
        player.deleteQueue(guildId);
        return message.reply({
          content: 'Could not join your voice channel!',
        });
      }

      if (searchResult.playlist) queue.addTracks(searchResult.tracks);
      else queue.addTrack(searchResult.tracks[0]);

      if (!queue.playing) await queue.play();
    } catch (error) {
      Logging.Error(error);
      message.reply({
        content: `There was an error trying to execute that command: ${error.message}`,
      });
    }
  },
};
