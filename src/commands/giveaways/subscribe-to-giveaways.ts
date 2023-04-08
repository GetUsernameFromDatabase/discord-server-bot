import { getTextBasedChannel } from '#lib/discord-fetch';
import { Command } from '@sapphire/framework';
import { PermissionsBitField } from 'discord.js';
import { GiveawayChannelStore } from '../../store/giveaway-store';
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

    const { client, user, channelId } = interaction;
    const channel =
      interaction.channel ?? (await getTextBasedChannel(channelId));
    if (!channel) {
      return interaction.editReply('Error: Channel not found');
    }

    const key = GiveawayChannelStore.generateKey(channel, user);
    const oldChannelID = client.giveawayChannels.get(key);

    if (oldChannelID !== channelId) {
      client.giveawayChannels.set(key, channelId);
      const store = new GiveawayChannelStore();
      store.update([...client.giveawayChannels]);
    }

    const { discordTime, toUnixTimecode } = client.utils.date;
    const nextUnixTimecode = toUnixTimecode(GiveawayNotifier.cron.next());
    await interaction.editReply(
      `${
        oldChannelID
          ? 'This channel already is subscribed'
          : 'This channel is now subscribed to giveaways'
      }\nNext fetch will happen at: ${discordTime(nextUnixTimecode)}`
    );
  }
}
