import { getTextBasedChannel } from '#lib/discord-fetch';
import { Command } from '@sapphire/framework';
import { PermissionsBitField } from 'discord.js';
import {
  GetGiveaways,
  GiveawayFetchMessages,
} from '../../giveaways/giveaway-fetching';
import { GiveawayChannelStore } from '../../store/giveaway-store';

//TODO: either an option to stop giveaways from being sent here or in a different command
export class GiveawayChannelChangeCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      description: 'Send giveaways to this channel',
      requiredUserPermissions: PermissionsBitField.Flags.ManageChannels,
    });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) => {
      builder //
        .setName(this.name)
        .setDescription(this.description)
        .addBooleanOption((option) =>
          option
            .setName('force')
            .setDescription("force send even if there aren't any new giveaways")
        );
    });
  }

  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ) {
    let force = interaction.options.getBoolean('force') ?? false;
    await interaction.deferReply();

    const { client, user, channelId } = interaction;
    const channel =
      interaction.channel ?? (await getTextBasedChannel(channelId));
    if (!channel) {
      return interaction.editReply('Error: Channel not found');
    }

    let key: string;
    if (channel.isDMBased()) {
      force = true;
      key = `DM_${user.id}`;
    } else {
      key = `GUILD_${channel.guildId}`;
    }

    const oldChannelID = client.giveawayChannels.get(key);
    if (oldChannelID !== channelId) {
      force = true;
      client.giveawayChannels.set(key, channelId);
      const store = new GiveawayChannelStore();
      store.update([...client.giveawayChannels]);
    }

    await interaction.editReply('I will notify giveaways here');
    const result = await GetGiveaways(channel, force);
    if (result !== 'SUCCESS')
      void interaction.editReply(GiveawayFetchMessages[result]);
  }
}
