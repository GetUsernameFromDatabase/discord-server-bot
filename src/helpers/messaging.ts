import * as Discord from 'discord.js';
import type { TextBasedChannelSendOptionsWithoutPayload } from '@/messaging.js';
import { SegmentString } from './text-manipulation.js';
import { ID } from './identification.js';
import { FetchMessages } from './discord-fetch.js';

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
): boolean {
  if (typeof toCheck === 'string' || toCheck.content) {
    const checkAgainst =
      typeof toCheck === 'string' ? toCheck : toCheck.content;
    return messages.some((message) => message.content === checkAgainst);
  } else if (toCheck.embeds?.length) {
    const toCheckEmbeds = toCheck.embeds as Discord.APIEmbed[];
    return messages.some((message) => {
      if (
        message.embeds.length === 0 ||
        message.embeds.length !== toCheckEmbeds.length
      ) {
        return false;
      }
      const sameEmbeds = message.embeds.every((embed, embedIndex) => {
        const toCheckEmbed = toCheckEmbeds[embedIndex];
        if (embed.title?.trim() !== toCheckEmbed.title?.trim()) return false;
        if (
          !toCheckEmbed.fields ||
          embed.fields.length !== toCheckEmbed.fields.length
        ) {
          return false;
        }
        const sameFields = embed.fields.every((field, fieldIndex) => {
          const toCheckField = toCheckEmbed.fields?.at(fieldIndex);
          const sameName = field.name.trim() === toCheckField?.name.trim();
          const sameValue = field.value.trim() === toCheckField?.value.trim();
          return sameName && sameValue;
        });
        return sameFields;
      });
      return sameEmbeds;
    });
  } else {
    throw new Error('Check not implemented');
  }
}

export function BuildMessageableEmbeds(
  toConvert: Discord.EmbedBuilder[]
): Discord.MessageCreateOptions {
  return { embeds: toConvert.map((x) => x.toJSON()) };
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
  channel: Discord.TextBasedChannel,
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
    globalThis.logger.error(`Couldn't fetch channel (${channel.id} messages)`);
    return false;
  }

  const messagesSentByBot = fetchedMessages
    .filter((message) => message.author.bot)
    .map((message) => message);

  const checkedMessages = messages.filter(
    (message) => !IsDuplicateMessage(message, messagesSentByBot)
  );
  for (const message of checkedMessages) void channel.send(message);
  return true;
}
export const testPrivate = { MdHAsEmbedFieldTitle };
