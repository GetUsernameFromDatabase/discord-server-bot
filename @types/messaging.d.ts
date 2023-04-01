import { MessageCreateOptions, MessagePayload } from 'discord.js';

export type TextBasedChannelSendOptions =
  | string
  | MessagePayload
  | MessageCreateOptions;

export type TextBasedChannelSendOptionsWithoutPayload = Exclude<
  TextBasedChannelSendOptions,
  MessagePayload
>;
