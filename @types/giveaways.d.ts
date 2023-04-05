export interface GiveawayObject {
  title: string;
  url: string;
  body: string;
  imageURL?: string;
}

interface GiveawayObjectJSON {
  title: string;
  url: string;
  /** ISO String */
  created_date: string;
  /** ISO String */
  updated_date: string;
}

export interface GiveawaySite {
  url: string;
  callback: (html: string) => GiveawayObject[] | Promise<GiveawayObject[]>;
}

export interface GiveawaySites {
  [x: string]: GiveawaySite;
}
