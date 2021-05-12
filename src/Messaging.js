import { MessageEmbed } from 'discord.js';

import Logging from './Logging.js';
import { ID, client } from './Identification.js';
import { SegmentString } from './TextManipulation.js';

const blank = '\u200B';

/**
 * @param {String | Discord.MessageEmbed |Discord.Message} msgToCheck Message to be checked
 * @param {{content: string;embeds: Discord.MessageEmbed[]}[]} messages Messages to check against
 * @return {Boolean} Wheter it was a duplicate or not
 */
export function IsDuplicateMessage(msgToCheck, messages) {
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
 * @param {Discord.MessageEmbed} MsgEmbed
 * @param {Boolean} hexColour To use bot role colour or not
 * @returns {Discord.MessageEmbed}
 */
function Signature(MsgEmbed, hexColour = true) {
  const me = ID.Maintainer;

  MsgEmbed.setFooter(`Bot by ${me.tag}`, me.avatarURL()).setTimestamp();

  if (hexColour) {
    const colour = ID.Server.member(client.user).displayHexColor;
    MsgEmbed.setColor(colour);
  }

  return MsgEmbed;
}

/**
 * @param {String | String[] | Discord.EmbedField[]} fields
 * @param {{title: String, url: String}} title
 * @returns {Discord.MessageEmbed}
 */
export function GetEmbeddedMsg(
  fields,
  title = { title: '', url: '' },
  imageURL = ''
) {
  /* eslint-disable no-param-reassign */
  const { normalizeField } = MessageEmbed;
  let embedFields = [];
  if (typeof fields.name === 'undefined') {
    if (Array.isArray(fields))
      fields = fields.reduce(
        (acc, curr) => acc.concat(SegmentString(curr)),
        []
      );
    else fields = SegmentString(fields);

    // Accounts for MD headings while making embedFields
    const mdH = '#';
    fields.forEach((field) => {
      const fieldWithH = field.split(new RegExp(`(${mdH}+[^${mdH}]*)`));
      fieldWithH.forEach((h) => {
        if (h === '') return;
        let name = null;
        if (h.startsWith(mdH)) {
          [name] = h.split('\n').trim();
          h = h.replace(`${name}\n`, blank);
        }
        embedFields.push(normalizeField(name || blank, h.trim()));
      });
    });
  } else embedFields = fields;

  const MesEmb = new MessageEmbed()
    .setTitle(title.title.trim())
    .addFields(embedFields);
  if (typeof title.url !== 'undefined' && title.url !== '')
    MesEmb.setURL(title.url.trim());
  if (imageURL !== '') MesEmb.setImage(imageURL);

  return Signature(MesEmb);
} /* eslint-enable no-param-reassign */

/**
 * Messages should be all the same type
 * @param {Discord.TextChannel} channel TextChannel where to send
 * @param {Discord.MessageEmbed[] | Discord.Message[]} messages Messages to send
 * @param {Boolean} [checkDupes] Default is true
 * @returns {Boolean} Wether it was successful or not
 */
export async function MassMessageSend(channel, messages, checkDupes = true) {
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
    .filter((msg) => !IsDuplicateMessage(msg, filteredChanMsgs))
    .forEach((msg) => channel.send(msg));
  return true;
}

/**
 * @param {Discord.Message} msg
 */
export function ReactToCommand(msg) {
  const value = msg.content.split(' ');
  // eslint-disable-next-line no-unused-vars
  const cmd = value[0];
}
