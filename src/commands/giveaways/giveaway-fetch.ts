import { Command } from '@sapphire/framework';
import { PermissionsBitField } from 'discord.js';
import { GiveawayFetchMessages } from '../../giveaways/giveaways-fetching';

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
    const client = interaction.client;
    const giv = client.handlers.giveaway;
    void giv.ChangeChannel(interaction.channelId);
    const force = interaction.options.getBoolean('force') ?? false;

    await interaction.reply('This channel will be notified about giveaways');
    const result = await giv.GetGiveaways(force);
    if (result !== 'SUCCESS')
      void interaction.editReply(GiveawayFetchMessages[result]);
  }
}
