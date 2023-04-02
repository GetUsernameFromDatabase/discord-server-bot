import { useQueue } from 'discord-player';
import {
  SlashCommand,
  SlashCreator,
  CommandContext,
  CommandOptionType,
} from 'slash-create';

export default class extends SlashCommand {
  constructor(creator: SlashCreator) {
    super(creator, {
      name: 'seek',
      description: 'Seek to the given time',
      options: [
        {
          name: 'time',
          description: 'The time to seek to (in seconds)',
          type: CommandOptionType.INTEGER,
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

    const time = context.options.time * 1000;
    await queue.node.seek(time);

    return context.send({
      content: `✅ | Seeked to ${time / 1000} seconds`,
    });
  }
}
