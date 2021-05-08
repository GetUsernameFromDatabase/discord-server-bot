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

  /**
   * @param {String | String[] | Discord.EmbedField[]} fields
   * @param {{title: String, url: String}} title
   * @returns {Discord.MessageEmbed}
   */
  static GetEmbeddedMsg(fields, title = { title: '', url: '' }, imageURL = '') {
    /* eslint-disable no-param-reassign */
    const maxFieldValue = 1024;
    // https://stackoverflow.com/questions/6259515/how-can-i-split-a-string-into-segments-of-n-characters
    // https://regex101.com/ I love this site
    const sizeRe = new RegExp(`[\\s\\S]{1,${maxFieldValue}}(?<=\\n|$)`, 'g');

    let embedFields = [];
    if (typeof fields === 'string' || typeof fields[0] === 'string') {
      if (Array.isArray(fields)) {
        fields.forEach((str) => str.match(sizeRe));
      } else {
        fields = fields.match(sizeRe);
      }
      fields.forEach((field) =>
        embedFields.push({ name: Messaging.blank, value: field, inline: false })
      );
    } else {
      embedFields = fields;
    }

    const MesEmb = new Discord.MessageEmbed()
      .setTitle(title.title)
      .addFields(embedFields);
    if (typeof title.url !== 'undefined' && title.url !== '')
      MesEmb.setURL(title.url);
    if (imageURL !== '') MesEmb.setImage(imageURL);

    return this.Signature(MesEmb);
  } /* eslint-enable no-param-reassign */

  /**
   * @param {Discord.MessageEmbed} MsgEmbed
   * @param {Boolean} hexColour To use bot role colour or not
   * @returns {Discord.MessageEmbed}
   */
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
   * @param {String | Discord.MessageEmbed |Discord.Message} msgToCheck Message to be checked
   * @param {{content: string;embeds: Discord.MessageEmbed[]}[]} messages Messages to check against
   * @return {Boolean} Wheter it was a duplicate or not
   */
  static IsDuplicateMessage(msgToCheck, messages) {
    const msgEmbedTypes = ['rich', 'image', 'video', 'gifv', 'article', 'link'];
    const checkAgainstEmbeds = (obj) =>
      obj.embeds[0].title === msgToCheck.title;
    const checkAgainstContent = (obj) =>
      obj.content === (msgToCheck.content || msgToCheck);

    const callback = msgEmbedTypes.includes(msgToCheck.type)
      ? checkAgainstEmbeds
      : checkAgainstContent;
    return messages.some(callback);
  }

  /**
   * Messages should be all the same type
   * @param {Discord.TextChannel} channel TextChannel where to send
   * @param {Discord.MessageEmbed[] | Discord.Message[]} messages Messages to send
   * @param {Boolean} [checkDupes] Default is true
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
