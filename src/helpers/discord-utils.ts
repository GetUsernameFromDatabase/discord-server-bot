import type { VoiceResult1, VoiceResult2 } from '@/helpers/utils';
import type {
  ChatInputCommandSuccessPayload,
  Command,
  ContextMenuCommandSuccessPayload,
  MessageCommandSuccessPayload,
} from '@sapphire/framework';
import { container } from '@sapphire/framework';
import { cyan } from 'colorette';
import {
  Guild,
  GuildMember,
  GuildTextBasedChannel,
  Interaction,
  PermissionsBitField,
  User,
} from 'discord.js';

function isGuildTextBasedChannel(
  interaction: Command.ChatInputCommandInteraction | GuildTextBasedChannel
): interaction is GuildTextBasedChannel {
  if ('applicationId' in interaction) return false;
  return true;
}
export function voice(
  interaction: Command.ChatInputCommandInteraction
): VoiceResult1;
export function voice(interaction: GuildTextBasedChannel): VoiceResult2;

// https://github.com/itsauric/karasu-music-bot/blob/master/src/lib/utils.ts
export function voice(
  interaction: Command.ChatInputCommandInteraction | GuildTextBasedChannel
) {
  if (isGuildTextBasedChannel(interaction)) {
    return {
      get events() {
        const resolved = new PermissionsBitField([
          PermissionsBitField.Flags.SendMessages,
          PermissionsBitField.Flags.ViewChannel,
        ]);
        const missingPerms = interaction
          .permissionsFor(interaction.guild.members.me!)
          .missing(resolved);
        return missingPerms.length;
      },
    };
  }

  const memberVoice = (interaction.member as GuildMember).voice;
  return {
    get member() {
      if (!memberVoice.channel)
        return `${emojis.error} | You **need** to be in a voice channel.`;
    },
    get client() {
      const resolved = new PermissionsBitField([
        PermissionsBitField.Flags.Connect,
        PermissionsBitField.Flags.Speak,
        PermissionsBitField.Flags.ViewChannel,
      ]);
      const missingPerms = memberVoice.channel
        ?.permissionsFor(interaction.guild!.members.me!)
        .missing(resolved);

      if (missingPerms && missingPerms.length > 0)
        return `${
          emojis.error
        } | I am **missing** the required voice channel permissions: \`${missingPerms.join(
          ', '
        )}\``;
    },
    get clientToMember() {
      if (
        interaction.guild?.members.me?.voice.channelId &&
        memberVoice.channelId !== interaction.guild?.members.me?.voice.channelId
      )
        return `${emojis.error} | You are **not** in my voice channel`;
    },
  };
}

export function options(interaction: Interaction) {
  return {
    metadata: {
      channel: interaction.channel,
      client: interaction.guild?.members.me,
    },
    leaveOnEmptyCooldown: 300_000,
    leaveOnEmpty: true,
    leaveOnEnd: false,
    bufferingTimeout: 0,
    selfDeaf: true,
  };
}

export function logSuccessCommand(
  payload:
    | ContextMenuCommandSuccessPayload
    | ChatInputCommandSuccessPayload
    | MessageCommandSuccessPayload
): void {
  const successLoggerData: ReturnType<typeof getSuccessLoggerData> =
    'interaction' in payload
      ? getSuccessLoggerData(
          payload.interaction.guild,
          payload.interaction.user,
          payload.command
        )
      : getSuccessLoggerData(
          payload.message.guild,
          payload.message.author,
          payload.command
        );

  container.logger.debug(
    `${successLoggerData.shard} - ${successLoggerData.commandName} ${successLoggerData.author} ${successLoggerData.sentAt}`
  );
}

function getSuccessLoggerData(
  guild: Guild | null,
  user: User,
  command: Command
) {
  const shard = `[${cyan(guild?.shardId ?? 0).toString()}]`;
  const commandName = cyan(command.name);
  const author = `${user.username}[${cyan(user.id)}]`;
  const sentAt = guild ? `${guild.name}[${cyan(guild.id)}]` : 'Direct Messages';
  return { shard, commandName, author, sentAt };
}

export const emojis = {
  get success() {
    return ':sweet:';
  },
  get error() {
    return ':x:';
  },
};

export const date = {
  toUnixTimecode(this: void, date: Date) {
    return date.getTime() / 1000;
  },
  discordTime(this: void, unixTime: number) {
    return `<t:${unixTime}>`;
  },
};
