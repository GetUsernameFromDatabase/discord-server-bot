import { getChannelParentID, getTextBasedChannel } from '#lib/discord-fetch';
import { Command } from '@sapphire/framework';
import { PermissionsBitField } from 'discord.js';
import cronstrue from 'cronstrue';
import { GiveawayNotifier } from '../../jobs/giveaways';
import { DB } from '@/database/database';

export class SubscribeToGiveawaysCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
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

    const { client, channelId } = interaction;
    const channel =
      interaction.channel ?? (await getTextBasedChannel(channelId));
    if (!channel) {
      return interaction.editReply('Error: Channel not found');
    }

    const channelParentId = getChannelParentID(channel);
    const query = DB.replaceInto('channel_purposes').values({
      channel_container: channelParentId.id,
      channel_id: channel.id,
      channel_purpose: 'givaways',
    });
    await query.execute();

    const { discordTime, toUnixTimecode } = client.utils.date;
    const nextUnixTimecode = toUnixTimecode(GiveawayNotifier.cron.next());

    return interaction.editReply(
      `This channel is subscribed to giveaways\n` +
        `Next fetch will happen at ${discordTime(nextUnixTimecode)}`
    );
  }
}
