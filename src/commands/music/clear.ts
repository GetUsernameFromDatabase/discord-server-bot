import { useQueue } from 'discord-player';
import { SlashCommand, SlashCreator, CommandContext } from 'slash-create';

export default class extends SlashCommand {
  constructor(creator: SlashCreator) {
    super(creator, {
      name: 'clear',
      description: 'Clear the current queue.',

      guildIDs: process.env.DISCORD_GUILD_ID
        ? [process.env.DISCORD_GUILD_ID]
        : undefined,
    });
  }

  async run(context: CommandContext) {
    await context.defer();

    const queue = useQueue(context.guildID ?? '');
    if (!queue)
      return void context.send({
        content: '❌ | No music in the queue!',
      });

    queue.clear();

    return context.send({ content: '❌ | Queue cleared.' });
  }
}
