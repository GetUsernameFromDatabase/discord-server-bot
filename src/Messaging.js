const {
  Identification,
  client
} = require('./Identification');
const { Similarity } = require('./TextManipulation');
const { Commands } = require('./Commands');
const Discord = require('discord.js');
const Server = Identification.Server;

class Messaging {
  /* Minimum prediction similarity -
  is used to determine how similar text has to be to a command before it suggests it to the user */
  static mps = 0.3;

  static blank = '\u200B'; // A way to not fill a field element

  static HelpCMD = Commands.Command('help');

  static ALLCOMMANDS = []; // Placeholder

  static WrongCommand(msg) {
    let suggestion = 'I do not recognize this command\nDid you mean to write: `';
    let noIdea = `Write \`${Messaging.HelpCMD.cmd}\` to know what commands are available`;

    // Finds how similar the message is to all commands
    let predictions = {};
    Messaging.ALLCOMMANDS.forEach(x => {
      let chance = Similarity(x.cmd, msg);
      predictions[chance] = x.cmd;
    });

    let maxChance = predictions.keys().reduce((a, b) => {
      return Math.max(a, b);
    });

    let response = maxChance >= this.mps
      ? suggestion + predictions[maxChance] + '`'
      : noIdea;

    return response;
  }

  static ReactToCommand(msg) {
    let value = msg.content.split(' ');
    // eslint-disable-next-line no-unused-vars
    let cmd = value[0];
  }

  static MakeCustomField(title, value, inline = false) {
    return {
      name: title === '' ? '\u200B' : title,
      value: value,
      inline: inline
    };
  }

  static EmbeddedMessage(title = '', titleURL = '', fields = [], imageURL = '') {
    let maxFieldValue = 1024;

    function TextIntoField(text) {
      return {
        name: Messaging.blank,
        value: text,
        inline: false
      };
    }

    function TextTooBig(text, fieldTitle = Messaging.blank) {
      // https://stackoverflow.com/questions/6259515/how-can-i-split-a-string-into-segments-of-n-characters
      let sizeRe = new RegExp(`.{1,${maxFieldValue}}`, 'g');
      let texts = text.match(sizeRe) || [];

      // Neccessary if there is a need for a field title
      let newFields = new Array({
        name: fieldTitle,
        value: texts[0],
        inline: false
      });
      // Adds the rest of the strings into the fields array
      for (let i = 1; i < texts.length; i++) {
        newFields.push(TextIntoField(texts[i]));
      }
      return newFields;
    }

    function StringsToFieldObj(strArray) {
      let newFields = [];
      strArray.forEach(field => {
        /* eslint-disable no-param-reassign */
        if (typeof (field) === typeof ('')) {
          if (field.length >= maxFieldValue) {
            field = TextTooBig(field);
          } else {
            field = new Array(TextIntoField(field));
          }
        } else if (field.value.length >= maxFieldValue) {
          field = TextTooBig(field.value, field.name);
        } else {
          field = new Array(field);
        }
        /* eslint-enable no-param-reassign */
        newFields = newFields.concat(field);
      });
      return newFields;
    }

    // fields input can be just a string in an array
    let MesEmb = new Discord.MessageEmbed()
      .setTitle(title)
      .addFields(StringsToFieldObj(fields));
    if (titleURL !== '') { MesEmb.setURL(titleURL); }
    if (imageURL !== '') { MesEmb.setImage(imageURL); }
    return this.Signature(MesEmb);
  }

  static Signature(MsgEmbed, hexColour = true) {
    let me = Identification.MyUser;

    MsgEmbed.setFooter(
      'Bot by ' + me.tag,
      me.avatarURL()
    ).setTimestamp();

    if (hexColour) {
      let colour = Server.members.cache.get(client.user.id).displayHexColor;
      MsgEmbed.setColor(colour);
    }

    return MsgEmbed;
  }

  static CheckDuplicateMessage(message, messages) {
    function GetMsgValue(msg) {
      return msg.fields.length === 0 ? msg.description : msg.fields[0].value;
    }

    if (message.type === 'rich') {
      return messages.some(msg => {
        return GetMsgValue(msg) === GetMsgValue(message);
      });
    }
    return messages.some(msg => {
      return msg.content === message.content;
    });
  }

  static MassMessageSend(messages, channel, messageType = null) {
    function GetFilteredArray(TextChanMsgs) {
      return TextChanMsgs.fetch({
        limit: 100
      }).then(chanMsgs => {
        if (messageType === 'rich') {
          let embeds = [];
          chanMsgs.forEach(msg => { embeds = embeds.concat(msg.embeds); });
          return embeds;
        }
        return Array.from(chanMsgs.filter(msg => {
          return msg.type === messageType;
        }).keys());
      // eslint-disable-next-line no-console
      }).catch(console.error);
    }

    if (messageType === null) {
      messages.forEach(msg => channel.send(msg));
    } else {
      GetFilteredArray(channel.messages).then(chanMsgs => {
        messages.forEach(msg => {
          if (!this.CheckDuplicateMessage(msg, chanMsgs)) {
            channel.send(msg);
          }
        });
      });
    }
  }
}
exports.Messaging = Messaging;
