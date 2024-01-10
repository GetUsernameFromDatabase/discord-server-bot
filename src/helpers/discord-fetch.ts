import { container } from '@sapphire/framework';
import type { Collection, Message, TextBasedChannel } from 'discord.js';

/**
 * Messages should be all the same type
 * @param channel channel from where to fetch messages
 * @param limit Messages to send
 */
export async function FetchMessages(
  channel: TextBasedChannel,
  limit = 50
): Promise<void | Collection<string, Message>> {
  const maxChanMsgs = await channel.messages
    .fetch({ limit })
    .catch((error) => globalThis.logger.error(error));
  return maxChanMsgs;
}

export async function getTextBasedChannel(
  ChannelID: string
): Promise<TextBasedChannel | undefined> {
  const { client } = container;
  const channel = await client.channels.fetch(ChannelID);
  if (!channel?.isTextBased()) {
    client.logger.error(`Could not fetch TextBasedChannel: ${ChannelID}`);
    return;
  }
  return channel;
}
