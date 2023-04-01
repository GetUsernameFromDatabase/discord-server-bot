import Giveaways, { GiveawayFetchMessages } from '../../giveaways.js';
import {
  SlashCommand,
  SlashCreator,
  CommandContext,
  CommandOptionType,
} from 'slash-create';
import { client } from '../../helpers/identification.js';
import { HandlerKeys } from '../../client/custom-client.js';

export default class extends SlashCommand {
  constructor(creator: SlashCreator) {
    super(creator, {
      name: 'giveaways',
      description: 'Sends giveaways to this channel',
      guildIDs: process.env.DISCORD_GUILD_ID
        ? [process.env.DISCORD_GUILD_ID]
        : undefined,
      options: [
        {
          name: 'force',
          description: "force send even if there aren't any new giveaways",
          type: CommandOptionType.BOOLEAN,
        },
      ],
      // https://discord.com/developers/docs/topics/permissions
      requiredPermissions: ['MANAGE_CHANNELS'], //'MANAGE_CHANNELS'
    });
  }
  async run(context: CommandContext) {
    await context.defer();
    const giv = client.handlers.get(HandlerKeys.Giveaways) as Giveaways;

    void giv.ChangeChannel(context.channelID);
    const force = (context.options.force as boolean | undefined) ?? false;
    console.log('FORCE_OPTION:', force);

    void context.sendFollowUp('This channel will be notified about giveaways');
    const result = await giv.GetGiveaways(force);
    if (result !== 'SUCCESS')
      void context.sendFollowUp(GiveawayFetchMessages[result]);
  }
}
