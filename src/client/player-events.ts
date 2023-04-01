import { TextChannel } from 'discord.js';
import Logging from '../logging.js';
import { Player } from 'discord-player';

export default function registerPlayerEvents(player: Player) {
  player.events.on('error', (queue, error) => {
    Logging.Log(
      `[${queue.guild.name}] Error emitted from the queue: ${error.message}`
    );
  });
  player.events.on('playerError', (queue, error) => {
    Logging.Log(
      `[${queue.guild.name}] Error emitted from the connection: ${error.message}`
    );
  });
  player.events.on('disconnect', (queue) => {
    const channel = queue.metadata as TextChannel;
    void channel.send(
      '❌ | I was manually disconnected from the voice channel, clearing queue!'
    );
  });

  player.events.on('audioTrackAdd', (queue, track) => {
    const channel = queue.metadata as TextChannel;
    void channel.send(`🎶 | Track **${track.title}** queued!`);
  });
  player.events.on('audioTracksAdd', (queue, tracks) => {
    const channel = queue.metadata as TextChannel;
    void channel.send(`🎶 | ${tracks.length} tracks added to the queue!`);
  });

  player.events.on('emptyChannel', (queue) => {
    const channel = queue.metadata as TextChannel;
    void channel.send('❌ | Nobody is in the voice channel, leaving...');
  });
  player.events.on('emptyQueue', (queue) => {
    const channel = queue.metadata as TextChannel;
    void channel.send('✅ | Queue finished!');
  });
}
