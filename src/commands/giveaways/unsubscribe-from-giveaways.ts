import { getChannelParentID, getTextBasedChannel } from '#lib/discord-fetch';
import { DB } from '@/database/database';
import { Command } from '@sapphire/framework';
import { PermissionsBitField } from 'discord.js';

export class UnsubscribeToGiveawaysCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      description: 'Stop sending giveaways here.',
      requiredUserPermissions: PermissionsBitField.Flags.ManageChannels,
    });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) => {
      builder.setName(this.name).setDescription(this.description);
    });
  }

  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ) {
    await interaction.deferReply();

    const { channelId } = interaction;
    const channel =
      interaction.channel ?? (await getTextBasedChannel(channelId));
    if (!channel) {
      return interaction.editReply('Error: Channel not found');
    }

    const channelParentId = getChannelParentID(channel);
    const query = DB.deleteFrom('channel_purposes')
      .where('channel_container', '=', channelParentId.id)
      .where('channel_id', '=', channel.id);
    const result = await query.executeTakeFirst();

    if (result.numDeletedRows > 0) {
      return interaction.editReply(`Successfully unsubscribed`);
    }
    return interaction.editReply(`Channel was not subscribed before`);
  }
}
