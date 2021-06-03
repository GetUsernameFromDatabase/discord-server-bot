/* eslint-disable max-classes-per-file */
// Currently used just to replace calls to Discord API
// https://stackoverflow.com/questions/60916450/jest-testing-discord-bot-commands
import { jest } from '@jest/globals';

jest.disableAutomock(); // Required if enableAutomock is used anywhere else
/** @type {import('discord.js')} */
const Discord = jest.requireActual('discord.js');

// a counter so that all the ids are unique
let count = 0;
// the user that executes the commands
export const userMock = {
  id: (count++).toString(),
  username: 'username',
  discriminator: '1234',
};

// the bot
export const botMock = {
  id: (count++).toString(),
  username: 'BOTMOCK',
  discriminator: '1234',
  bot: true,
};

export class Client extends Discord.Client {}
export class User extends Discord.User {}
export class Collection extends Discord.Collection {}
export class Permissions extends Discord.Permissions {}
export class MessageEmbed extends Discord.MessageEmbed {}

export class Guild extends Discord.Guild {
  constructor(client) {
    super(client, {
      // you don't need all of these but I just put them in to show you all the properties that Discord.js uses
      id: (count++).toString(),
      name: `MockGuild: ${count}`,
      owner_id: 'GetUsernameFromDatabase',
      region: '',
      afk_timeout: 0,
      verification_level: 0,
      default_message_notifications: 0,
      explicit_content_filter: 0,
      roles: [],
      emojis: [],
      features: [],
      mfa_level: 0,
      system_channel_flags: 0,
      widget_enabled: false,
    });
    this.client?.guilds.cache.set(this.id, this);
  }
}

export class Message extends Discord.Message {
  constructor(channel, content, author = userMock) {
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
        mentions: [],
        mention_roles: [],
        mention_everyone: false,
      },
      channel
    );
  }
}

export class MessageManager extends Discord.MessageManager {
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
      name: `MockChannel: ${count}`,
      type: 0,
    });
    this.client.channels.cache.set(this.id, this);
    this.guild.channels.cache.set(this.id, this);
    /** @type {MessageManager} */
    this.messages = new MessageManager(this);
  }

  // you can modify this for other things like attachments and embeds if you need
  send(content) {
    const message = {
      id: Discord.SnowflakeUtil.generate(),
      type: 0,
      channel_id: this.id,
      author: botMock,
      pinned: false,
      tts: false,
      nonce: '',
      embeds: [],
      attachments: [],
      timestamp: Date.now(),
      edited_timestamp: Date.now(),
      mentions: [],
      mention_roles: [],
      mention_everyone: false,
    };

    message.content = typeof content === 'string' ? content : '';
    if (typeof content === 'string') message.content = content;
    else {
      message.content = '';
      message.embeds.push(content);
    }
    return this.client.actions.MessageCreate.handle(message);
  }
}
