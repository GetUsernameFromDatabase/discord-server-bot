import {
  SlashCommand,
  SlashCreator,
  CommandContext,
  CommandOptionType,
} from 'slash-create';
import { client } from '../../helpers/identification.js';
import { QueryType } from 'discord-player';
import { User } from 'discord.js';

export default class extends SlashCommand {
  constructor(creator: SlashCreator) {
    super(creator, {
      name: 'play',
      description: 'Play the requested song/playlist',
      options: [
        {
          name: 'query',
          type: CommandOptionType.STRING,
          description: 'The song you want to play',
          required: true,
        },
      ],

      guildIDs: process.env.DISCORD_GUILD_ID
        ? [process.env.DISCORD_GUILD_ID]
        : undefined,
    });
  }

  async run(context: CommandContext) {
    await context.defer();

    const guildID = context.guildID ?? '';
    const guild = client.guilds.cache.get(guildID);
    if (!guild) {
      throw new Error(`Guild not found: ${guildID}`);
    }
    const channel = guild.channels.cache.get(context.channelID);
    const query = context.options.query as string;
    const searchResult = await client.player
      .search(query, {
        requestedBy: context.user as unknown as User,
        searchEngine: QueryType.AUTO,
      })
      .catch(() => {
        console.log('he');
      });
    if (!searchResult || searchResult.tracks.length === 0)
      return void context.sendFollowUp({ content: 'No results were found!' });

    const queue = client.player.nodes.create(guild, {
      metadata: channel,
    });

    const member =
      guild.members.cache.get(context.user.id) ??
      (await guild.members.fetch(context.user.id));
    if (!member.voice.channel) {
      return void context.sendFollowUp({
        content: 'You are not in a voice channel',
      });
    }
    try {
      if (!queue.connection) await queue.connect(member.voice.channel);
    } catch {
      client.player.nodes.delete(guildID);
      return void context.sendFollowUp({
        content: 'Could not join your voice channel!',
      });
    }

    await context.sendFollowUp({
      content: `⏱ | Loading your ${
        searchResult.playlist ? 'playlist' : 'track'
      }...`,
    });

    console.log(searchResult.tracks);
    console.log(queue.node.isPlaying());
    searchResult.playlist
      ? queue.addTrack(searchResult.tracks)
      : queue.addTrack(searchResult.tracks[0]);

    if (!queue.node.isPlaying()) await queue.node.play();
  }
}
