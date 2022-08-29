import * as Discord from 'discord.js';
import Logging from '../Logging.js';
import { SegmentString } from '../TextManipulation.js';
import { ID, client } from '../helpers/Identification.js';

export const blank = '\u200B';

/**
 * @returns {Discord.EmbedField}
 */
function stringWithHeaderIntoEmbedField(string) {
  const splitter = '\n';
  const strings = string.split(splitter);

  const title = strings.shift().trim();
  const restOfString = strings.join(splitter);
  return {
    name: title || blank,
    value: restOfString || blank,
  };
}

/** Accounts for MD headings while making embedFields
 * @param {String[]} stringsToBeFields
 * @returns {Discord.EmbedField}
 */
function MdHAsEmbedFieldTitle(stringsToBeFields) {
  /** @type {Discord.EmbedFieldData[]} */
  const embedFields = [];
  const mdH = '#'; // Markdown Header

  for (const string of stringsToBeFields) {
    // Creates a String[] where strings with headers are seperated
    const stringsWHS = string.split(new RegExp(`((?<=\\s)${mdH}+[^${mdH}]*)`));
    for (const strWHS of stringsWHS) {
      if (!strWHS) continue;
      const embedField = strWHS.startsWith(mdH)
        ? stringWithHeaderIntoEmbedField(strWHS)
        : { name: blank, value: strWHS };
      embedFields.push(embedField);
    }
  }
  return embedFields;
}

/**
 * @param {String | String[]} strings */
function stringsToEmbedField(strings) {
  const stringArray = Array.isArray(strings)
    ? strings.flatMap((string) => [...SegmentString(string)])
    : SegmentString(strings);
  return MdHAsEmbedFieldTitle(stringArray);
}

/**
 * @param {String | String[] | Discord.EmbedField | Discord.EmbedField[]} fields
 * @param options
 * @returns {Discord.EmbedBuilder} */
export function GetMsgEmbed(fields, { title = '', url = '', imageURL = '' }) {
  let embedFields =
    typeof fields === 'string' ? stringsToEmbedField(fields) : fields;
  if (Array.isArray(fields)) {
    embedFields = fields.map((field) =>
      typeof field === 'string' ? stringsToEmbedField(field) : field
    );
  }

  const MesEmb = new Discord.EmbedBuilder()
    .setColor('#F1C40F')
    .setTitle(title.trim())
    .addFields(embedFields)
    .setFooter({ text: `Bot by ${ID.Me.tag}`, iconURL: ID.Me.avatarURL() })
    .setTimestamp();
  if (url) MesEmb.setURL(url.trim());
  if (imageURL) MesEmb.setImage(imageURL);

  return MesEmb;
}

/**
 * @param {String | Discord.EmbedBuilder | Discord.Message} msgToCheck
 * @param {Discord.Message[]} messages to check against
 * @return {Boolean} Wheter it was a duplicate or not */
export function IsDuplicateMessage(msgToCheck, messages) {
  const checkTitle = msgToCheck.data?.title;
  /** @param {Discord.Message} obj */
  const EmbedCheck = (obj) => {
    const objEmb = obj.embeds[0];
    return checkTitle === objEmb?.data?.title;
  };
  /** @param {Discord.Message} obj */
  const contentCheck = (obj) =>
    obj.content === (msgToCheck.content ?? msgToCheck);

  const callback = checkTitle ? EmbedCheck : contentCheck;
  return messages.some((element) => callback(element));
}

/** Messages should be all the same type
 * @param {Discord.TextChannel} channel channel from where to fetch messages
 * @param {Number} limit Messages to send */
export async function FetchMessages(channel, limit = 100) {
  const maxChanMsgs = await channel.messages.fetch({ limit }).catch((error) => {
    Logging.Error(error, undefined, false);
  });
  return maxChanMsgs;
}

/** Messages should be all the same type
 * @param {Discord.TextChannel} channel TextChannel where to send
 * @param {Discord.EmbedBuilder[] | Discord.Message[]} messages Messages to send
 * @param {Boolean} [checkDupes] Default is true
 * @returns {Boolean} Wether it was successful or not */
export async function MassMessageSend(channel, messages, checkDupes = true) {
  if (!checkDupes) {
    for (const msg of messages) channel.send(msg);
    return true;
  }

  const maxChanMsgs = await FetchMessages(channel);
  if (typeof maxChanMsgs === 'undefined') {
    Logging.Error(`Couldn't fetch ${channel.name} messages`);
    return false;
  }

  const filteredChanMsgs = maxChanMsgs
    .filter((msg) => msg.author.id === client.user.id)
    .map((msg) => ({ content: msg.content, embeds: msg.embeds }));

  /** @type {{Discord.EmbedBuilder[] | Discord.Message[]}} */
  const checkedMessages = messages.filter(
    (msg) => !IsDuplicateMessage(msg, filteredChanMsgs)
  );
  for (const msg of checkedMessages) {
    if (typeof msg === 'string') channel.send(msg);
    else channel.send({ embeds: [msg].flat() });
  }
  return true;
}

/**
 * @param {String[]} args
 * @param {String} usage */
export function CheckArgLength(args, usage = '') {
  const argReq = {
    required: usage.match(/\[/g)?.length ?? 0,
    optional: usage.match(/\(/g)?.length ?? 0,
  };
  const sum = argReq.optional + argReq.required;

  let response;
  if (args.length < argReq) {
    response = `This command requires ${argReq.required} arguments
      ${args.length} given`;
  } else if (sum === 0 && args.length > 0) {
    response = "This command doesn't take any arguments";
  }
  return response;
}

export const testPrivate = { MdHAsEmbedFieldTitle };
