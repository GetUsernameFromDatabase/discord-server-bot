import { getEmbedBuilder, stringsToEmbedField } from '#lib/discord-messaging';
import { MessageBuilder } from '@sapphire/discord.js-utilities';
import { TextBasedChannel, hyperlink } from 'discord.js';

export interface GiveawayObject {
  title: string;
  url: string;
  body: string;
  imageURL?: string;
}

export class Giveaway {
  static convertGiveawayObjects(giveawayObjects: GiveawayObject[]) {
    return giveawayObjects.map((x) => new Giveaway(x));
  }

  giveaway: GiveawayObject;
  constructor(giveawayObject: GiveawayObject) {
    this.giveaway = giveawayObject;
  }

  asEmbed() {
    const { body, title, url, imageURL } = this.giveaway;
    const embedFields = stringsToEmbedField(body);
    const builder = getEmbedBuilder()
      .setTitle(title)
      .setURL(url)
      .addFields(embedFields);

    if (imageURL) builder.setImage(imageURL);
    return builder;
  }

  asMessage() {
    const { title, url } = this.giveaway;
    const embed = this.asEmbed();
    const messageBuilder = new MessageBuilder({
      content: hyperlink(title, url),
      embeds: [embed],
    });
    return messageBuilder;
  }

  sendToChannel(channel: TextBasedChannel) {
    return channel.send(this.asMessage());
  }
}
