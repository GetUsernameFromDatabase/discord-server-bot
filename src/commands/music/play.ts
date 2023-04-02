import {
  SlashCommand,
  SlashCreator,
  CommandContext,
  CommandOptionType,
  AutocompleteContext,
} from 'slash-create';
import { client } from '../../helpers/identification.js';
import logging from '../../logging.js';

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
          autocomplete: true,
          required: true,
        },
      ],

      guildIDs: process.env.DISCORD_GUILD_ID
        ? [process.env.DISCORD_GUILD_ID]
        : undefined,
    });
  }

  async autocomplete(context: AutocompleteContext) {
    const player = client.player;
    const query = context.options.query as string;
    const results = await player.search(query);

    void context.sendResults(
      results.tracks.slice(0, 10).map((t) => ({
        name: t.title,
        value: t.url,
      }))
    );
  }

  async run(context: CommandContext) {
    await context.defer();
    const player = client.player;
    const guildID = context.guildID ?? '';
    const guild = client.guilds.cache.get(guildID);
    if (!guild) {
      void context.send('Guild not found');
      throw new Error(`Guild not found: ${guildID}`);
    }
    const messageChannel = guild.channels.cache.get(context.channelID);
    const query = context.options.query as string;

    const member =
      guild.members.cache.get(context.user.id) ??
      (await guild.members.fetch(context.user.id));
    const voiceChannel = member.voice.channel;
    if (!voiceChannel) {
      return void context.send({
        content: 'You are not in a voice channel',
      });
    }

    const searchResult = await player.search(query, { requestedBy: member });
    if (!searchResult.hasTracks())
      return context.send(`We found no tracks for ${query}!`);

    try {
      await player.play(voiceChannel, searchResult, {
        nodeOptions: {
          metadata: messageChannel, // we can access this metadata object using queue.metadata later on
        },
      });
      await context.send(`⏱ | Loading your track`);
    } catch (error) {
      const ERROR = error as Error;
      logging.Error(ERROR);
      // let's return error if something failed
      return context.send(`Something went wrong: ${ERROR.message}`);
    }
  }
}
