import Logging from './Logging.js';

/**
 * @param {import('discord-player').Queue} queue */
function manualLeaveOnEmpty(queue) {
  if (queue.playing) return;
  queue.destroy();
  Logging.Log('Left manually on empty :(');
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
    setTimeout(() => {
      Logging.Log();
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
