import { getTextBasedChannel } from '#lib/discord-fetch';
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

    return interaction.editReply('WIP');
    // const store = client.sqlStores.GiveawayChannel;
    // const result = await store.deleteChannel(channel);
    // if (!result.changes) {
    //   return interaction.editReply(`Channel was not subscribed before`);
    // }
    // await interaction.editReply(`Successfully unsubscribed`);
  }
}
