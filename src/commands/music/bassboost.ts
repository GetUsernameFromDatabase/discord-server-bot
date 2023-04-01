import { SlashCommand, SlashCreator, CommandContext } from 'slash-create';

import { client } from '../../helpers/identification.js';

export default class extends SlashCommand {
  constructor(creator: SlashCreator) {
    super(creator, {
      name: 'bassboost',
      description: 'Toggle bassboost filter',

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

    await queue.filters.ffmpeg.toggle(['bassboost', 'normalizer2']);
    queue.filters.ffmpeg.isEnabled('bassboost');

    setTimeout(() => {
      const status = queue.filters.ffmpeg.isEnabled('bassboost')
        ? 'Enabled'
        : 'Disabled';
      return void context.sendFollowUp({
        content: `🎵 | Bassboost ${status}!`,
      });
    }, queue.options.bufferingTimeout);
  }
}
