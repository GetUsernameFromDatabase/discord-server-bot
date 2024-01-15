import { getEmbedBuilder, stringsToEmbedField } from '#lib/discord-messaging';
import { DB } from '@/database/database';
import { MessageBuilder } from '@sapphire/discord.js-utilities';
import { TextBasedChannel, hyperlink } from 'discord.js';
import { sql } from 'kysely';

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
    for (const key in giveawayObject) {
      const value = giveawayObject[key as keyof GiveawayObject];
      if (typeof value === 'string') {
        giveawayObject[key as keyof GiveawayObject] = value.trim();
      }
    }
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

  storeIntoDatabase() {
    const { title, url } = this.giveaway;
    const query = DB.insertInto('giveaways')
      .onConflict((oc) =>
        oc.doUpdateSet({ last_ping_at: sql`CURRENT_TIMESTAMP` })
      )
      .values({ title, url });
    void query.execute();
  }
}
