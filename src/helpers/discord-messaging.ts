import { container } from '@sapphire/framework';
import * as Discord from 'discord.js';
import { SegmentString } from './text-manipulation';

export const blank = '\u200B';

/**
 * Gets discord embed with following properties set:
 * - colour -- '#F1C40F'
 * - footer -- bot by message
 * - timestamp
 */
export function getEmbedBuilder() {
  const { maintainer } = container.client;
  const builder = new Discord.EmbedBuilder({
    footer: {
      text: `Bot by ${maintainer.tag}`,
      iconURL: maintainer.avatarURL() ?? undefined,
    },
  })
    .setColor('#F1C40F')
    .setTimestamp();
  return builder;
}

export function stringsToEmbedField(
  strings: string | string[]
): Discord.APIEmbedField[] {
  const stringArray: string[] | null = Array.isArray(strings)
    ? strings.flatMap((string) => [...(SegmentString(string) ?? [])])
    : SegmentString(strings);

  if (!stringArray) {
    globalThis.logger.error(new Error('Not string array'), strings);
    return [{ name: 'ERROR', value: 'SOMETHING WENT WRONG -- STRARR' }];
  }
  return tryMarkdownHeaderFieldTitle(stringArray);
}

/**
 * Accounts for MD headings while making embedFields
 */
function tryMarkdownHeaderFieldTitle(stringsToBeFields: string[]) {
  const embedFields: Discord.APIEmbedField[] = [];
  const mdH = '#'; // Markdown Header

  for (const string of stringsToBeFields) {
    /**
     * Strings with markdown header, S is just to emphasize plurar\
     * List of strings where markdown headers are seperated
     */
    const mdhStringS = string.split(new RegExp(`((?<=\\s)${mdH}+[^${mdH}]*)`));
    for (const mdhString of mdhStringS) {
      if (!mdhString) continue;

      const embedField: Discord.APIEmbedField = mdhString.startsWith(mdH)
        ? embedFieldWithMarkdownHeaderName(mdhString)
        : { name: blank, value: mdhString };
      embedFields.push(embedField);
    }
  }
  return embedFields;
}

function embedFieldWithMarkdownHeaderName(
  string: string
): Discord.APIEmbedField {
  const splitter = '\n';
  const strings = string.split(splitter);

  const title = strings.shift()?.trim();
  const restOfString = strings.join(splitter);
  return {
    name: title || blank,
    value: restOfString || blank,
  };
}
