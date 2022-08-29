import { PermissionsBitField } from 'discord.js';
import { client } from '../../helpers/Identification.js';
import { categories } from '../Commands.js';
// https://discord.com/developers/docs/topics/permissions

export default {
  name: 'giveaways',
  description: 'Sends giveaways to this channel',
  category: categories.Giveaways,
  guildOnly: true,
  permissions: PermissionsBitField.Flags.ManageChannels,
  /**
   * @param {import('discord.js').Message} message
   * @param {String[]} args */
  async execute(message) {
    /** @type {import('../../Giveaways').default} */
    const giv = client.handlers.get('giveaways');
    giv.ChangeChannel(message.channel.id);

    message.channel.send('This channel will be notified about giveaways');
    giv.GetGiveaways();
  },
};
