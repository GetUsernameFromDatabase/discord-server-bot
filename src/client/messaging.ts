import * as Discord from 'discord.js';
import Logging from '../logging.js';
import { SegmentString } from '../helpers/text-manipulation.js';
import { ID, client } from '../helpers/identification.js';
import { TextBasedChannelSendOptionsWithoutPayload } from '@/messaging.js';

export const blank = '\u200B';

function stringWithHeaderIntoEmbedField(string: string): Discord.APIEmbedField {
  const splitter = '\n';
  const strings = string.split(splitter);

  const title = strings.shift()?.trim();
  const restOfString = strings.join(splitter);
  return {
    name: title || blank,
    value: restOfString || blank,
  };
}

/**
 * Accounts for MD headings while making embedFields
 */
function MdHAsEmbedFieldTitle(stringsToBeFields: string[]) {
  const embedFields: Discord.APIEmbedField[] = [];
  const mdH = '#'; // Markdown Header

  for (const string of stringsToBeFields) {
    // Creates a String[] where strings with headers are seperated
    const stringsWHS = string.split(new RegExp(`((?<=\\s)${mdH}+[^${mdH}]*)`));
    for (const stringWHS of stringsWHS) {
      if (!stringWHS) continue;
      const embedField: Discord.APIEmbedField = stringWHS.startsWith(mdH)
        ? stringWithHeaderIntoEmbedField(stringWHS)
        : { name: blank, value: stringWHS };
      embedFields.push(embedField);
    }
  }
  return embedFields;
}

function stringsToEmbedField(
  strings: string | string[]
): Discord.APIEmbedField[] {
  const stringArray: string[] | null = Array.isArray(strings)
    ? strings.flatMap((string) => [...(SegmentString(string) ?? [])])
    : SegmentString(strings);
  if (!stringArray) return [{ name: 'ERROR', value: 'SOMETHING WENT WRONG' }];
  return MdHAsEmbedFieldTitle(stringArray);
}

export function GetMessageEmbed(
  fields: string | string[] | Discord.APIEmbedField | Discord.APIEmbedField[],
  { title = '', url = '', imageURL = '' }
) {
  let embedFields: Discord.APIEmbedField | Discord.APIEmbedField[];
  if (typeof fields === 'string') {
    embedFields = stringsToEmbedField(fields);
  } else if (Array.isArray(fields)) {
    embedFields = fields.flatMap((field) =>
      typeof field === 'string' ? stringsToEmbedField(field) : field
    );
  } else embedFields = fields;

  const MesEmb = new Discord.EmbedBuilder()
    .setColor('#F1C40F')
    .setTitle(title.trim())
    .addFields(...embedFields)
    .setFooter({
      text: `Bot by ${ID.Maintainer.tag}`,
      iconURL: ID.Maintainer.avatarURL() ?? undefined,
    })
    .setTimestamp();
  if (url) MesEmb.setURL(url.trim());
  if (imageURL) MesEmb.setImage(imageURL);
  return MesEmb;
}

/**
 * @param messages to check against
 * @returns Wheter it was a duplicate or not
 */
export function IsDuplicateMessage(
  toCheck: TextBasedChannelSendOptionsWithoutPayload,
  messages: Discord.Message[]
) {
  // TODO: fix giveaways not being filtered
  // eslint-disable-next-line unicorn/prefer-ternary
  if (toCheck instanceof Discord.Embed) {
    return messages.some((message) => {
      const firstEmbed = message.embeds[0];
      return toCheck.data.title === firstEmbed?.data?.title;
    });
  } else {
    const checkContent =
      typeof toCheck === 'string' ? toCheck : toCheck.content;
    return messages.some((message) => {
      return checkContent ?? toCheck === message.content;
    });
  }
}

/**
 * Messages should be all the same type
 *
 * @param channel channel from where to fetch messages
 * @param limit Messages to send
 */
export async function FetchMessages(channel: Discord.TextChannel, limit = 100) {
  const maxChanMsgs = await channel.messages.fetch({ limit }).catch((error) => {
    Logging.Error(error as Error, undefined, false);
  });
  return maxChanMsgs;
}

export function ConvertEmbedToMessage(
  toConvert: Discord.EmbedBuilder
): TextBasedChannelSendOptionsWithoutPayload {
  return { embeds: [toConvert] };
}

/**
 * Messages should be all the same type
 *
 * @param  channel TextChannel where to send
 * @param  messages Messages to send
 * @param  checkDupes [true] checks if the bot has sent the message before
 * @returns Wether it was successful or not
 */
export async function MassMessageSend(
  channel: Discord.TextChannel,
  messages: TextBasedChannelSendOptionsWithoutPayload[],
  checkDupes = true
) {
  if (!checkDupes) {
    for (const message of messages) {
      void channel.send(message);
    }
    return true;
  }

  const fetchedMessages = await FetchMessages(channel);
  if (fetchedMessages === undefined) {
    Logging.Error(new Error(`Couldn't fetch ${channel.name} messages`));
    return false;
  }

  const messagesSentByBot = fetchedMessages
    .filter((message) => message.author.id === client.user?.id)
    .map((message) => message);

  const checkedMessages = messages.filter(
    (message) => !IsDuplicateMessage(message, messagesSentByBot)
  );
  for (const message of checkedMessages) void channel.send(message);
  return true;
}
export const testPrivate = { MdHAsEmbedFieldTitle };