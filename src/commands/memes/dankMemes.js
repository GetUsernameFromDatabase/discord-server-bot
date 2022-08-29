import redditFetch from '../../services/Reddit.js';
import { categories } from '../Commands.js';

export default {
  name: 'dankMemes',
  description: 'Gets a meme from r/Memes_Of_The_Dank',
  category: categories.Memes,
  usage: '(type)',
  /**
   * @param {import('discord.js').Message} message
   * @param {String[]} args */
  async execute(message, args) {
    const subreddit = 'Memes_Of_The_Dank';
    const [type] = args;

    const reddit = redditFetch({ subreddit, sort: type });
    if (reddit.errorMessage) message.reply(reddit.errorMessage);
  },
};
