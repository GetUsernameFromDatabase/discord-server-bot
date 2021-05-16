/* eslint-disable max-classes-per-file */
// https://stackoverflow.com/questions/60916450/jest-testing-discord-bot-commands
import * as Discord from 'discord.js';
// a counter so that all the ids are unique
let count = 0;

class Guild extends Discord.Guild {
  constructor(client) {
    super(client, {
      // you don't need all of these but I just put them in to show you all the properties that Discord.js uses
      id: (count++).toString(),
      name: 'MockGuild',
      icon: null,
      splash: null,
      owner_id: 'GetUsernameFromDatabase',
      region: '',
      afk_channel_id: null,
      afk_timeout: 0,
      verification_level: 0,
      default_message_notifications: 0,
      explicit_content_filter: 0,
      roles: [],
      emojis: [],
      features: [],
      mfa_level: 0,
      application_id: null,
      system_channel_flags: 0,
      system_channel_id: null,
      widget_enabled: false,
      widget_channel_id: null,
    });
    this.client.guilds.cache.set(this.id, this);
  }
}

export class Message extends Discord.Message {
  constructor(content, channel, author) {
    super(
      channel.client,
      {
        id: (count++).toString(),
        type: 0,
        channel_id: channel.id,
        content,
        author,
        pinned: false,
        tts: false,
        nonce: '',
        embeds: [],
        attachments: [],
        timestamp: Date.now(),
        edited_timestamp: null,
        mentions: [],
        mention_roles: [],
        mention_everyone: false,
      },
      channel
    );
  }
}

class MessageManager extends Discord.MessageManager {
  // eslint-disable-next-line no-underscore-dangle, no-unused-vars
  async _fetchMany(options = {}, cache) {
    /** @type {TextChannel} */
    const chan = this.channel;
    return chan.messages.cache;
  }
}

export class TextChannel extends Discord.TextChannel {
  constructor(guild) {
    super(guild, {
      id: (count++).toString(),
      name: 'MockChannel',
      type: 0,
    });
    this.client.channels.cache.set(this.id, this);
    this.guild.channels.cache.set(this.id, this);
    /** @type {MessageManager} */
    this.messages = new MessageManager(this);
  }

  // you can modify this for other things like attachments and embeds if you need
  send(content) {
    return this.client.actions.MessageCreate.handle({
      id: Discord.SnowflakeUtil.generate(),
      type: 0,
      channel_id: this.id,
      content,
      author: {
        id: 'Mock Bot',
        username: 'MOCKAH',
        discriminator: '1234',
        bot: true,
      },
      pinned: false,
      tts: false,
      nonce: '',
      embeds: [],
      attachments: [],
      timestamp: Date.now(),
      edited_timestamp: null,
      mentions: [],
      mention_roles: [],
      mention_everyone: false,
    });
  }
}

export const client = new Discord.Client();
export const guild = new Guild(client);
export const channel = new TextChannel(guild);

// the user that executes the commands
export const user = {
  id: count++,
  username: 'username',
  discriminator: '1234',
};
