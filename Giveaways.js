const cfg = require('./configs/config.json');
const {
  client
} = require('./Identification');

const {
  WebScraping
} = require('./WebScraping');
const {
  TextManipulation
} = require('./TextManipulation');
const {
  Messaging
} = require('./Messaging');
const {
  Commands
} = require('./Commands');

const minInMs = 60 * 1000;

class Giveaways {
  constructor() {
    // Initiates giveaway functions
    this.channel = client.channels.cache.get(cfg.TestChanID);
    this.GetGiveaways();
    setInterval(this.GetGiveaways, 60 * minInMs);
  }

  static URL = 'https://steamcommunity.com/groups/GrabFreeGames/announcements/listing';

  static pointers = [
    /*
    First element in pointers is used to find the box where information can be extracted
    the rest is info that need to be taken out from these boxes.
    */
    '<div class="announcement">',
    '<a class="large_title" href="',
    '<div class="bodytext" id="abody_'
  ];

  static channelID = cfg.GiveawaysID;

  static commands = new Commands([
    Commands.Command(
      'giveaways',
      this.giveawaysCmdResponse,
      'Giveaways will be sent to the channel where this commands was used'
    )
  ]);

  giveawaysCmdResponse(msg) {
    let message = 'This channel will be notified about giveaways';
    // Changes the giveaway channel and notifies about the change
    this.channel = msg.channel;
    this.channel.send(message);

    this.PostGiveaways();
  }

  GetGiveaways() {
    WebScraping.SimpleFetch(Giveaways.URL, Giveaways.pointers).then(
      (val) => this.PostGiveaways(val)
    ).catch(
      (error) => {
        // eslint-disable-next-line no-console
        console.error('Failed to reach giveaway website');
        // eslint-disable-next-line no-console
        console.error(error);
      }
    );
  }

  PostGiveaways(data = []) {
    function UnformatTextFromHTML(input) {
      /*
      Gets rid of /t :(, <br> => \n, gets rid of span and blockquote html elements
      Removes hyperlink elements but gets the visible text
      then turns HTML formatting into Markdown, finally Trims
      */
      // I REALLY NEED TO MAKE IT ITERATE OVER THE TEXT ONLY ONCE
      let text = input;
      // Replaces the tabs between webpage id and the actualy body of text
      text = TextManipulation.ReplacerAll(text, '\t');

      if (text.indexOf('<') === -1) { return text; } // Stops the process if not needed

      // Changes breaks into \n
      text = TextManipulation.ReplacerAll(text, '<br>', '\n');
      // Removes hyperlink elements but gets the visible text
      text = WebScraping.HyperlinklessText(text);

      // (span) Since GrabFreeGames does not color text, we remove them
      // || MIGHT BECOME A PROBLEM LATER
      ['span', 'blockquote']
        .forEach(tag => { text = WebScraping.ReplaceElementHTML(text, tag); });

      // Does like the name says
      text = WebScraping.HtmlFormattingToMarkdown(text);
      text = text.trim(); // Removes spaces on both sides
      return text;
    }

    function GetEmbedMessage(box) {
      // Title Section
      let urlStart = 'href="';
      let latS = '">'; // Link and title seperator

      let urlSl = box[0].indexOf(urlStart) + urlStart.length;
      let latSl = box[0].indexOf(latS); // latS location

      let titleURL = box[0].slice(urlSl, latSl);
      let title = box[0].slice(latSl + latS.length);

      // Value section
      let textBaseStart = box[1].indexOf(latS);
      if (textBaseStart !== -1) { textBaseStart += latS.length; }

      let textBase = box[1].slice(textBaseStart).split('<div class="bb_h1">');
      let headinglessText = UnformatTextFromHTML(textBase[0]);
      headinglessText = Messaging.MakeCustomField('', headinglessText);

      let fields = new Array(headinglessText);
      for (let i = 1; i < textBase.length; i++) {
        let subtext = textBase[i].split('</div>');
        title = UnformatTextFromHTML(subtext[0]);
        let value = UnformatTextFromHTML(subtext[1]);

        fields.push(Messaging.MakeCustomField(title, value));
      }
      // eslint-disable-next-line no-console
      console.log(titleURL);
      // eslint-disable-next-line no-console
      console.log(fields);

      // Giving Credit Section
      // let imageURL = "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/46/46cc1fb9f4453f06e9ef5cc40ef90f1d06d779c7_full.jpg"
      let creditOld = 'We are welcoming everyone to join our discord. We are more active there on finding giveaways, small or large, and there are daily raffles you can participate.';
      let creditNew = 'Information taken from:\n' + titleURL;

      let creditText = fields[fields.length - 1].value;
      // eslint-disable-next-line no-unused-vars
      creditText = creditText.replace(creditOld, creditNew);

      return Messaging.EmbeddedMessage(title, titleURL, fields);
    }

    // The Core
    let messages = [];

    // eslint-disable-next-line no-param-reassign
    data = data.reverse(); // So that it would start posting old giveaways first
    data.forEach(box => messages.push(GetEmbedMessage(box)));

    Messaging.MassMessageSend(messages, this.channel, messages[0].type);
  }
}
exports.Giveaways = Giveaways;
