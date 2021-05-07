const Discord = require('discord.js');
const { Identification, client } = require('./Identification');
const { Similarity } = require('./TextManipulation');
const { Commands } = require('./Commands');
const { Logging } = require('./Logging');

const { Server } = Identification;

class Messaging {
  /* Minimum prediction similarity -
  is used to determine how similar text has to be to a command before it suggests it to the user */
  static mps = 0.3;

  static blank = '\u200B'; // A way to not fill a field element

  static HelpCMD = Commands.Command('help');

  static ALLCOMMANDS = []; // Placeholder

  static WrongCommand(msg) {
    const suggestion =
      'I do not recognize this command\nDid you mean to write: `';
    const noIdea = `Write \`${Messaging.HelpCMD.cmd}\` to know what commands are available`;

    // Finds how similar the message is to all commands
    const predictions = {};
    Messaging.ALLCOMMANDS.forEach((x) => {
      const chance = Similarity(x.cmd, msg);
      predictions[chance] = x.cmd;
    });

    const maxChance = predictions.keys().reduce((a, b) => Math.max(a, b));

    const response =
      maxChance >= this.mps
        ? `${suggestion + predictions[maxChance]}\``
        : noIdea;

    return response;
  }

  static ReactToCommand(msg) {
    const value = msg.content.split(' ');
    // eslint-disable-next-line no-unused-vars
    const cmd = value[0];
  }

  static MakeCustomField(title, value, inline = false) {
    return {
      name: title === '' ? '\u200B' : title,
      value,
      inline,
    };
  }

  static GetEmbeddedMsg(title = '', titleURL = '', fields = [], imageURL = '') {
    /* eslint-disable no-param-reassign */
    const maxFieldValue = 1024;
    if (typeof fields === 'string') {
      fields = new Array(fields);
    }

    function TextIntoField(text) {
      return {
        name: Messaging.blank,
        value: text,
        inline: false,
      };
    }

    // TODO: Make it account for markdown links and similar things
    function TextTooBig(text, fieldTitle = Messaging.blank) {
      // https://stackoverflow.com/questions/6259515/how-can-i-split-a-string-into-segments-of-n-characters
      const sizeRe = new RegExp(`.{1,${maxFieldValue}}`, 'g');
      const texts = text.match(sizeRe) || [];

      // Neccessary if there is a need for a field title
      const newFields = new Array({
        name: fieldTitle,
        value: texts[0],
        inline: false,
      });
      // Adds the rest of the strings into the fields array
      for (let i = 1; i < texts.length; i++) {
        newFields.push(TextIntoField(texts[i]));
      }
      return newFields;
    }

    const msgEmbedFields = [];
    fields.forEach((field) => {
      if (typeof field === 'string') {
        field =
          field.length >= maxFieldValue
            ? TextTooBig(field)
            : TextIntoField(field);
      } else if (field.value.length >= maxFieldValue) {
        field = TextTooBig(field.value, field.name);
      }

      if (Array.isArray(field)) {
        msgEmbedFields.concat(field);
      } else {
        msgEmbedFields.push(field);
      }
    });

    // fields input can be just a string in an array
    const MesEmb = new Discord.MessageEmbed()
      .setTitle(title)
      .addFields(msgEmbedFields);
    if (titleURL !== '') {
      MesEmb.setURL(titleURL);
    }
    if (imageURL !== '') {
      MesEmb.setImage(imageURL);
    }
    return this.Signature(MesEmb);
  } /* eslint-enable no-param-reassign */

  static Signature(MsgEmbed, hexColour = false) {
    const me = Identification.MyUser;

    MsgEmbed.setFooter(`Bot by ${me.tag}`, me.avatarURL()).setTimestamp();

    if (hexColour) {
      // let colour = Server.members.cache.get(client.user.id).displayHexColor;
      const colour = Server.member(client.user).displayHexColor;
      MsgEmbed.setColor(colour);
    }

    return MsgEmbed;
  }

  /**
   * @param {String | Discord.MessageEmbed |Discord.Message} message
   * @param {{content: string;embeds: Discord.MessageEmbed[]}[]} messages
   * @return {Boolean} Wheter it was a duplicate or not
   */
  static IsDuplicateMessage(message, messages) {
    const msgEmbedTypes = ['rich', 'image', 'video', 'gifv', 'article', 'link'];
    const checkAgainstEmbeds = (obj) => obj.embeds[0].title === message.title;
    const checkAgainstContent = (obj) =>
      obj.content === (message.content || message);

    const callback = msgEmbedTypes.includes(message.type)
      ? checkAgainstEmbeds
      : checkAgainstContent;
    return messages.some(callback);
  }

  /**
   * Messages should be all the same type
   * @param {Discord.TextChannel} channel
   * @param {Discord.MessageEmbed[] | Discord.Message[]} messages
   * @returns {Boolean} Wether it was successful or not
   */
  static async MassMessageSend(channel, messages, checkDupes = true) {
    if (!checkDupes) {
      messages.forEach((msg) => channel.send(msg));
      return true;
    }

    const maxChanMsgs = await channel.messages
      .fetch({ limit: 100 })
      .catch(Logging.Error);
    if (typeof maxChanMsgs === 'undefined') {
      Logging.Error(`Couldn't fetch ${channel.name} messages`);
      return false;
    }

    const filteredChanMsgs = maxChanMsgs
      .filter((msg) => msg.author.id === client.user.id)
      .map((msg) => ({ content: msg.content, embeds: msg.embeds }));
    messages
      .filter((msg) => !Messaging.IsDuplicateMessage(msg, filteredChanMsgs))
      .forEach((msg) => channel.send(msg));
    return true;
  }
}
exports.Messaging = Messaging;
