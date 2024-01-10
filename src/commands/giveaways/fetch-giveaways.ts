import { getTextBasedChannel } from '#lib/discord-fetch';
import { getEmbedBuilder, stringsToEmbedField } from '#lib/discord-messaging';
import {
  GetGiveaways,
  GiveawayStatuses,
  isGiveawayStatus,
} from '@/services/giveaway/index.js';
import { Command } from '@sapphire/framework';
import { PermissionsBitField } from 'discord.js';

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
      builder
        .setName(this.name)
        .setDescription(this.description)
        .addBooleanOption((option) =>
          option
            .setName('force')
            .setDescription('Does not check if previously sent')
        );
    });
  }

  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ) {
    // const force = interaction.options.getBoolean('force') ?? false;
    await interaction.deferReply();

    const { channelId } = interaction;
    const channel =
      interaction.channel ?? (await getTextBasedChannel(channelId));
    if (!channel) {
      return interaction.editReply('Error: Channel not found');
    }

    await interaction.editReply('Will search for new giveaways');
    const giveaways = await GetGiveaways();
    if (isGiveawayStatus(giveaways)) {
      const status = GiveawayStatuses[giveaways];
      return interaction.editReply(status.log_message);
    }

    for (const giveaway of giveaways) {
      const embedFields = stringsToEmbedField(giveaway.body);
      const builder = getEmbedBuilder()
        .setTitle(giveaway.title)
        .addFields(embedFields);
      if (giveaway.imageURL) {
        builder.setImage(giveaway.imageURL);
      }
      const builtEmbed = builder.toJSON();
      await channel.send({ embeds: [builtEmbed] });
      return;
    }
    return;
    // const result = await GetGiveaways(channel, {
    //   noFilter: true,
    //   ignorePreviousMessage: force,
    // });

    // if (result === 'SUCCESS') {
    //   void interaction.followUp('Giveaway fetch finished!');
    // } else {
    //   void interaction.editReply(GiveawayFetchMessages[result]);
    // }
  }
}
