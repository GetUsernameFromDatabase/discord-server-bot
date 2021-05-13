import { Permissions } from 'discord.js';
import { handlers } from '../../Main.js';
// https://discord.com/developers/docs/topics/permissions

export default {
  name: 'giveaways',
  description: 'Kick a user from the server.',
  guildOnly: true,
  permissions: Permissions.FLAGS.MANAGE_CHANNELS,
  /**
   * @param {import('discord.js').Message} message
   * @param {String[]} args */
  execute(message) {
    const giv = handlers.Giveaways;
    giv.channel = message.channel;
    giv.channel.send('This channel will be notified about giveaways');

    giv.GetGiveaways();
  },
};
