import { Permissions } from 'discord.js';
import { handlers } from '../../Identification.js';
import { categories } from '../Commands.js';
// https://discord.com/developers/docs/topics/permissions

export default {
  name: 'giveaways',
  description: 'Sends giveaways to this channel',
  category: categories.Giveaways,
  guildOnly: true,
  permissions: Permissions.FLAGS.MANAGE_CHANNELS,
  /**
   * @param {import('discord.js').Message} message
   * @param {String[]} args */
  execute(message) {
    const giv = handlers.Giveaways;
    giv.ChangeChannel(message.channel.id);

    message.channel.send('This channel will be notified about giveaways');
    giv.GetGiveaways();
  },
};
