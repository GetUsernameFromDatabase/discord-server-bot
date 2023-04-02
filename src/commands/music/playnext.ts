import {
  SlashCommand,
  SlashCreator,
  CommandContext,
  CommandOptionType,
} from 'slash-create';
import { client } from '../../helpers/identification.js';
import { QueryType, useQueue } from 'discord-player';
import { User } from 'discord.js';

export default class extends SlashCommand {
  constructor(creator: SlashCreator) {
    super(creator, {
      name: 'playnext',
      description: 'Add a song to the top of the queue',
      options: [
        {
          name: 'query',
          type: CommandOptionType.STRING,
          description: 'The song you want to play next',
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

    const queue = useQueue(context.guildID ?? '');
    if (!queue || !queue.node.isPlaying())
      return void context.send({
        content: '❌ | No music is being played!',
      });

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
      return void context.send({ content: 'No results were found!' });
    queue.node.insert(searchResult.tracks[0]);
    await context.send({ content: '⏱ | Loading your track...' });
  }
}
