import { getTextBasedChannel } from '#lib/discord-fetch';
import { Command } from '@sapphire/framework';
import { PermissionsBitField } from 'discord.js';
import {
  GetGiveaways,
  GiveawayFetchMessages,
} from '../../giveaways/giveaway-fetching';

export class FetchGiveawaysCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      description: 'Send giveaways to this channel',
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

    await interaction.editReply('Will search for new giveaways');
    const result = await GetGiveaways(channel, { noFilter: true });

    if (result === 'SUCCESS') {
      void interaction.followUp('Giveaway fetch finished!');
    } else {
      void interaction.editReply(GiveawayFetchMessages[result]);
    }
  }
}
