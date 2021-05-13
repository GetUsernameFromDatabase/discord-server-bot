import * as Discord from 'discord.js';

import Logging from './Logging.js';
import { ID, client } from './Identification.js';
import { SegmentString } from './TextManipulation.js';

const blank = '\u200B';
// Used to simulate TS in JS

/** Accounts for MD headings while making embedFields
 * @param {String[]} fields
 * @returns {Discord.EmbedField[]}
 */
function MdHAsEmbedFieldTitle(fields) {
  const { normalizeField } = Discord.MessageEmbed;
  const embedFields = [];
  const mdH = '#';

  fields.forEach((field) => {
    const fieldWithH = field.split(new RegExp(`(${mdH}+[^${mdH}]*)`));
    fieldWithH.forEach((h) => {
      if (h === '') return;
      let name = null;

      if (h.startsWith(mdH)) {
        [name] = h.split('\n').trim();
        // eslint-disable-next-line no-param-reassign
        h = h.replace(`${name}\n`, blank);
      }

      embedFields.push(normalizeField(name || blank, h.trim()));
    });
  });
  return embedFields;
}

/**
 * @param {String | String[] | Discord.EmbedField[]} fields
 * @returns {Discord.MessageEmbed}
 */
export function GetEmbeddedMsg(
  fields,
  title = { title: '', url: '' },
  imageURL = ''
) {
  /* eslint-disable no-param-reassign */
  if (typeof fields.name === 'undefined') {
    if (Array.isArray(fields))
      fields = fields.reduce(
        (acc, curr) => acc.concat(SegmentString(curr)),
        []
      );
    else fields = SegmentString(fields);

    fields = MdHAsEmbedFieldTitle(fields);
  }
  const embedFields = fields;

  const MesEmb = new Discord.MessageEmbed()
    .setColor(ID.Server.member(client.user)?.displayHexColor)
    .setTitle(title.title?.trim())
    .setURL(title.url?.trim())
    .addFields(embedFields)
    .setImage(imageURL)
    .setFooter(`Bot by ${ID.Me.tag}`, ID.Me.avatarURL())
    .setTimestamp();

  return MesEmb;
} /* eslint-enable no-param-reassign */

/**
 * @param {String | Discord.MessageEmbed |Discord.Message} msgToCheck Message to be checked
 * @param {{content: string;embeds: Discord.MessageEmbed[]}[]} messages Messages to check against
 * @return {Boolean} Wheter it was a duplicate or not
 */
export function IsDuplicateMessage(msgToCheck, messages) {
  const msgEmbedTypes = ['rich', 'image', 'video', 'gifv', 'article', 'link'];
  const EmbedCheck = (obj) => {
    const objEmb = obj.embeds[0];
    const titles = {
      obj: objEmb?.title.toLowerCase(),
      msg: msgToCheck.title.toLowerCase(),
    };
    const cond1 = titles.obj === titles.msg;
    return cond1;
  };
  const contentCheck = (obj) =>
    obj.content === (msgToCheck.content ?? msgToCheck);

  const callback = msgEmbedTypes.includes(msgToCheck.type)
    ? EmbedCheck
    : contentCheck;
  return messages.some(callback);
}

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
 * @param {String[]} args
 * @param {String} usage
 * @param {Discord.TextChannel} channel
 * @returns {Boolean} Wether it failed or not (true if it failed)
 */
export function CheckArgLength(args, usage, channel) {
  const argReq = {
    required: usage.match(/\[/g)?.length,
    optional: usage.match(/\(/g)?.length,
  };

  let response;
  if (args.length < argReq) {
    response = `This command requires ${argReq.required} arguments
      ${args.length} given`;
  } else if (args.length > argReq.optional + argReq.required) {
    response = `You have given more arguments than required
      given: ${args.length}, maximum: ${argReq.optional + argReq.optional}`;
  }

  const failure = typeof response === 'string';
  if (failure) channel.send(response);
  return failure;
}
