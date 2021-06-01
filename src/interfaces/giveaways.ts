export interface GiveawayObject {
  title: String;
  url: String;
  body: String;
  imageURL: String | undefined;
}
export type GiveawayArray = GiveawayObject[];

interface GiveawayObjectJSON {
  title: String;
  url: String;
  created_date: Date;
  updated_date: Date;
}
export type FetchedGiveawaysJSON = GiveawayObjectJSON[];
