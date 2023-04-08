import { getTextBasedChannel } from '#lib/discord-fetch';
import { Command } from '@sapphire/framework';
import { PermissionsBitField } from 'discord.js';
import { GiveawayChannelStore } from '../../store/giveaway-store';

export class UnsubscribeToGiveawaysCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
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

    const { client, user, channelId } = interaction;
    const channel =
      interaction.channel ?? (await getTextBasedChannel(channelId));
    if (!channel) {
      return interaction.editReply('Error: Channel not found');
    }

    const key = GiveawayChannelStore.generateKey(channel, user);
    if (!client.giveawayChannels.has(key)) {
      return interaction.editReply(`Channel was not subscribed before`);
    }

    client.giveawayChannels.delete(key);
    const store = new GiveawayChannelStore();
    store.update([...client.giveawayChannels]);
    await interaction.editReply(`Successfully unsubscribed`);
  }
}
