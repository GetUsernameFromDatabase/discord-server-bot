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
      name: 'volume',
      description: 'Set music volume',
      options: [
        {
          name: 'amount',
          type: CommandOptionType.INTEGER,
          description: 'The volume amount to set (0-100)',
          required: false,
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

    const vol = Number.parseInt(context.options.amount as string);
    if (!vol)
      return void context.send({
        content: `🎧 | Current volume is **${queue.node.volume}**%!`,
      });
    if (vol < 0 || vol > 100)
      return void context.send({
        content: '❌ | Volume range must be 0-100',
      });

    const success = queue.node.setVolume(vol);
    return void context.send({
      content: success
        ? `✅ | Volume set to **${vol}%**!`
        : '❌ | Something went wrong!',
    });
  }
}
