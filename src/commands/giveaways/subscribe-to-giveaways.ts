import { getTextBasedChannel } from '#lib/discord-fetch';
import { Command } from '@sapphire/framework';
import { PermissionsBitField } from 'discord.js';
import cronstrue from 'cronstrue';
import { GiveawayNotifier } from '../../jobs/giveaways';

export class SubscribeToGiveawaysCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      description: `Start sending giveaways here ${cronstrue.toString(
        GiveawayNotifier.cron.cron,
        { use24HourTimeFormat: true }
      )}`,
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
    // await store.saveChannel(channel);

    // const { discordTime, toUnixTimecode } = client.utils.date;
    // const nextUnixTimecode = toUnixTimecode(GiveawayNotifier.cron.next());

    // await interaction.editReply(
    //   `${'This channel is subscribed to giveaways'}\nNext fetch will happen at: ${discordTime(
    //     nextUnixTimecode
    //   )}`
    // );
  }
}
