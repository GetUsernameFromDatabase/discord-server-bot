import { GuildMember } from 'discord.js';
import Logging from './Logging.js';

/**
 * @param {import('discord-player').Queue} queue */
function manualLeaveOnEmpty(queue) {
  if (queue.playing) return;
  try {
    queue.destroy();
    Logging.Log('Left manually on empty :(');
  } catch (error) {
    Logging.Error(error, '----- Failed to destroy -----');
  }
}

/**
 * @param {import('discord-player').Player} player */
export default function addEventsToPlayer(player) {
  player.on('error', (queue, error) => {
    Logging.Log(
      `[${queue.guild.name}] Error emitted from the queue: ${error.message}`
    );
  });
  player.on('connectionError', (queue, error) => {
    Logging.Log(
      `[${queue.guild.name}] Error emitted from the connection: ${error.message}`
    );

    // Sometimes when a connectionError happens, the Player stops playing completely
    setTimeout(() => {
      try {
        queue.play();
      } catch (error_) {
        Logging.Error(error_);
      }
    }, 1500);
  });
  player.on('botDisconnect', (queue) => {
    queue.metadata.send(
      '❌ | I was manually disconnected from the voice channel, clearing queue!'
    );
  });

  player.on('trackAdd', (queue, track) => {
    queue.metadata.send(`🎶 | Track **${track.title}** queued!`);
  });
  player.on('tracksAdd', (queue, tracks) => {
    queue.metadata.send(`🎶 | ${tracks.length} tracks added to the queue!`);
  });

  player.on('channelEmpty', (queue) => {
    queue.metadata.send('❌ | Nobody is in the voice channel, leaving...');
  });
  player.on('queueEnd', (queue) => {
    queue.metadata.send('✅ | Queue finished!');
    setTimeout(() => {
      manualLeaveOnEmpty(queue);
    }, queue.options.leaveOnEmptyCooldown + 1000 || 1000);
  });
}

/**
 * @param {import('discord.js').Message} message */
export function isUserInVoiceChannel(message) {
  const { guild, member } = message;
  if (
    !(member instanceof GuildMember) ||
    !member.voice.channel ||
    (guild.me.voice.channelId &&
      member.voice.channelId !== guild.me.voice.channelId)
  ) {
    return message.reply({
      content: 'You are not in a voice channel!',
      ephemeral: true,
    });
  }
  return false;
}
