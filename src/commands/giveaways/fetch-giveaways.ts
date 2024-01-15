import { getTextBasedChannel } from '#lib/discord-fetch';
import { GiveawayService } from '@/services/giveaway/giveaway-service';
import { GiveawayStatusEnum } from '@/services/giveaway/giveaway-status';
import { Command } from '@sapphire/framework';
import { PermissionsBitField } from 'discord.js';

export class FetchGiveawaysCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      description: 'Send giveaways to this channel',
      requiredUserPermissions: PermissionsBitField.Flags.ManageChannels,
    });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) => {
      builder
        .setName(this.name)
        .setDescription(this.description)
        .addBooleanOption((option) =>
          option
            .setName('unfiltered')
            .setDescription(
              'Does not check if giveaways have been previously sent'
            )
        );
    });
  }

  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ) {
    const unfiltered = interaction.options.getBoolean('unfiltered') ?? false;
    await interaction.deferReply();

    const { channelId } = interaction;
    const channel =
      interaction.channel ?? (await getTextBasedChannel(channelId));
    if (!channel) {
      return interaction.editReply('Error: Channel not found');
    }

    await interaction.editReply('Will search for new giveaways');
    let giveawayService = await new GiveawayService().initialize();
    if (!unfiltered) {
      giveawayService = await giveawayService.filterGiveaways(channel);
    }

    const giveawayStatus = await giveawayService.sendGiveaways(channel);
    if (giveawayStatus.statusCode === GiveawayStatusEnum.SUCCESS) {
      return interaction.followUp('Giveaway fetch finished!');
    }
    return interaction.editReply(giveawayStatus.statusInformation.log_message);
  }
}
