import { useQueue } from 'discord-player';
import { SlashCommand, SlashCreator, CommandContext } from 'slash-create';

export default class extends SlashCommand {
  constructor(creator: SlashCreator) {
    super(creator, {
      name: 'skip',
      description: 'Skip to the current song',

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
    const currentTrack = queue.currentTrack?.toString() ?? 'NOT_FOUND';
    const success = queue.node.skip();
    return void context.send({
      content: success
        ? `✅ | Skipped **${currentTrack}**!`
        : '❌ | Something went wrong!',
    });
  }
}
