import { QueueRepeatMode } from 'discord-player';
import {
  SlashCommand,
  SlashCreator,
  CommandContext,
  CommandOptionType,
} from 'slash-create';
import { client } from '../../helpers/identification.js';

export default class extends SlashCommand {
  constructor(creator: SlashCreator) {
    super(creator, {
      name: 'loop',
      description: 'Set loop mode',
      options: [
        {
          name: 'mode',
          type: CommandOptionType.INTEGER,
          description: 'Loop type',
          required: true,
          choices: [
            {
              name: 'Off',
              value: QueueRepeatMode.OFF,
            },
            {
              name: 'Track',
              value: QueueRepeatMode.TRACK,
            },
            {
              name: 'Queue',
              value: QueueRepeatMode.QUEUE,
            },
            {
              name: 'Autoplay',
              value: QueueRepeatMode.AUTOPLAY,
            },
          ],
        },
      ],

      guildIDs: process.env.DISCORD_GUILD_ID
        ? [process.env.DISCORD_GUILD_ID]
        : undefined,
    });
  }

  async run(context: CommandContext) {
    await context.defer();
    const queue = client.player.nodes.get(context.guildID ?? '');
    if (!queue || !queue.node.isPlaying())
      return void context.sendFollowUp({
        content: '❌ | No music is being played!',
      });

    const loopMode = context.options.mode as QueueRepeatMode;
    queue.setRepeatMode(loopMode);
    const mode =
      loopMode === QueueRepeatMode.TRACK
        ? '🔂'
        : loopMode === QueueRepeatMode.QUEUE
        ? '🔁'
        : '▶';
    return void context.sendFollowUp({
      content: `${mode} | Updated loop mode!`,
    });
  }
}
