import redditFetch, { RedditSortTypeChoices } from '../../services/reddit.js';
import { RedditSortType } from '@/reddit.js';
import {
  SlashCommand,
  SlashCreator,
  CommandContext,
  CommandOptionType,
} from 'slash-create';

export default class extends SlashCommand {
  constructor(creator: SlashCreator) {
    super(creator, {
      name: 'dank_memes',
      description: 'Gets a meme from r/Memes_Of_The_Dank',
      guildIDs: process.env.DISCORD_GUILD_ID
        ? [process.env.DISCORD_GUILD_ID]
        : undefined,
      options: [
        {
          name: 'type',
          choices: RedditSortTypeChoices,
          description: 'reddit sorting type',
          type: CommandOptionType.STRING,
        },
      ],
    });
  }
  async run(context: CommandContext) {
    await context.defer();
    const subreddit = 'Memes_Of_The_Dank';

    const type: RedditSortType | null = context.options
      .sortingType as RedditSortType;

    void redditFetch({ subreddit, sort: type })
      .then((posts) => {
        console.log(posts);
        return;
      })
      .catch((error: Error) => {
        void context.sendFollowUp(error.message);
      });
  }
}
