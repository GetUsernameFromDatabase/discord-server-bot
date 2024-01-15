import { container } from '@sapphire/framework';
import type { TextBasedChannel } from 'discord.js';

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

export function getChannelParentID(channel: TextBasedChannel): {
  id: string;
  type: 'DM' | 'GUILD';
} {
  if (channel.isDMBased()) {
    const userID = channel.recipientId;
    return { id: userID, type: 'DM' };
  } else {
    const guildID = channel.guildId;
    return { id: guildID, type: 'GUILD' };
  }
}
