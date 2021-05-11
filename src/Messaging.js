import { MessageEmbed } from 'discord.js';

import { ID, client } from './Identification.js';
import TextManipulation from './TextManipulation.js';
import Commands from './Commands.js';
import Logging from './Logging.js';

export default class Messaging {
  /* Minimum prediction similarity -
  is used to determine how similar text has to be to a command before it suggests it to the user */
  static mps = 0.3;

  static blank = '\u200B'; // A way to not fill a field element

  static HelpCMD = Commands.MakeCommand('help');

  static ALLCOMMANDS = []; // Placeholder

  /**
   * Gets a response for a wrong command
   * @param {Discord.Message} msg Message to respond to
   * @returns {String} The response for the message
   */
  static WrongCommand(msg) {
    const suggestion =
      'I do not recognize this command\nDid you mean to write: `';
    const noIdea = `Write \`${Messaging.HelpCMD.cmd}\` to know what commands are available`;

    // Finds how similar the message is to all commands
    const predictions = {};
    Messaging.ALLCOMMANDS.forEach((x) => {
      const chance = TextManipulation.Similarity(x.cmd, msg);
      predictions[chance] = x.cmd;
    });

    const maxChance = predictions.keys().reduce((a, b) => Math.max(a, b));

    const response =
      maxChance >= this.mps
        ? `${suggestion + predictions[maxChance]}\``
        : noIdea;

    return response;
  }

  /**
   * @param {Discord.Message} msg
   */
  static ReactToCommand(msg) {
    const value = msg.content.split(' ');
    // eslint-disable-next-line no-unused-vars
    const cmd = value[0];
  }

  /**
   * @param {String | String[] | Discord.EmbedField[]} fields
   * @param {{title: String, url: String}} title
   * @returns {Discord.MessageEmbed}
   */
  static GetEmbeddedMsg(fields, title = { title: '', url: '' }, imageURL = '') {
    /* eslint-disable no-param-reassign */
    const segmentStr = TextManipulation.SegmentString;
    const { normalizeField } = MessageEmbed;
    let embedFields = [];
    if (typeof fields.name === 'undefined') {
      if (Array.isArray(fields))
        fields = fields.reduce((acc, curr) => acc.concat(segmentStr(curr)), []);
      else fields = segmentStr(fields);

      // Accounts for MD headings while making embedFields
      const mdH = '#';
      fields.forEach((field) => {
        const fieldWithH = field.split(new RegExp(`(${mdH}+[^${mdH}]*)`));
        fieldWithH.forEach((h) => {
          if (h === '') return;
          let name = null;
          if (h.startsWith(mdH)) {
            [name] = h.split('\n').trim();
            h = h.replace(`${name}\n`, Messaging.blank);
          }
          embedFields.push(normalizeField(name || Messaging.blank, h.trim()));
        });
      });
    } else embedFields = fields;

    const MesEmb = new MessageEmbed()
      .setTitle(title.title.trim())
      .addFields(embedFields);
    if (typeof title.url !== 'undefined' && title.url !== '')
      MesEmb.setURL(title.url.trim());
    if (imageURL !== '') MesEmb.setImage(imageURL);

    return this.Signature(MesEmb);
  } /* eslint-enable no-param-reassign */

  /**
   * @param {Discord.MessageEmbed} MsgEmbed
   * @param {Boolean} hexColour To use bot role colour or not
   * @returns {Discord.MessageEmbed}
   */
  static Signature(MsgEmbed, hexColour = true) {
    const me = ID.Maintainer;

    MsgEmbed.setFooter(`Bot by ${me.tag}`, me.avatarURL()).setTimestamp();

    if (hexColour) {
      const colour = ID.Server.member(client.user).displayHexColor;
      MsgEmbed.setColor(colour);
    }

    return MsgEmbed;
  }

  /**
   * @param {String | Discord.MessageEmbed |Discord.Message} msgToCheck Message to be checked
   * @param {{content: string;embeds: Discord.MessageEmbed[]}[]} messages Messages to check against
   * @return {Boolean} Wheter it was a duplicate or not
   */
  static IsDuplicateMessage(msgToCheck, messages) {
    const msgEmbedTypes = ['rich', 'image', 'video', 'gifv', 'article', 'link'];
    const checkAgainstEmbeds = (obj) => {
      const objEmb = obj.embeds[0];
      const titles = {
        obj: objEmb.title.toLowerCase(),
        msg: msgToCheck.title.toLowerCase(),
      };
      const cond1 = titles.obj === titles.msg;
      return cond1;
    };
    const checkAgainstContent = (obj) =>
      obj.content === (msgToCheck.content ?? msgToCheck);

    const callback = msgEmbedTypes.includes(msgToCheck.type)
      ? checkAgainstEmbeds
      : checkAgainstContent;
    return messages.some(callback);
  }

  /**
   * Messages should be all the same type
   * @param {Discord.TextChannel} channel TextChannel where to send
   * @param {Discord.MessageEmbed[] | Discord.Message[]} messages Messages to send
   * @param {Boolean} [checkDupes] Default is true
   * @returns {Boolean} Wether it was successful or not
   */
  static async MassMessageSend(channel, messages, checkDupes = true) {
    if (!checkDupes) {
      messages.forEach((msg) => channel.send(msg));
      return true;
    }

    const maxChanMsgs = await channel.messages
      .fetch({ limit: 100 })
      .catch((err) => {
        Logging.Error(err, undefined, false);
      });
    if (typeof maxChanMsgs === 'undefined') {
      Logging.Error(`Couldn't fetch ${channel.name} messages`);
      return false;
    }

    const filteredChanMsgs = maxChanMsgs
      .filter((msg) => msg.author.id === client.user.id)
      .map((msg) => ({ content: msg.content, embeds: msg.embeds }));
    messages
      .filter((msg) => !Messaging.IsDuplicateMessage(msg, filteredChanMsgs))
      .forEach((msg) => channel.send(msg));
    return true;
  }
}
