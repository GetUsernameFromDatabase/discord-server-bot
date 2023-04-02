import { useQueue } from 'discord-player';
import { SlashCommand, SlashCreator, CommandContext } from 'slash-create';

export default class extends SlashCommand {
  constructor(creator: SlashCreator) {
    super(creator, {
      name: 'shuffle',
      description: 'Shuffle the queue',

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

    queue.tracks.shuffle();

    return context.send({ content: '✅ | Queue has been shuffled!' });
  }
}
