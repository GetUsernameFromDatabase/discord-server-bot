export interface VoiceResult1 {
  client: string | undefined;
  member: string | undefined;
  clientToMember: string | undefined;
}

export interface VoiceResult2 {
  events: number;
}
// https://stackoverflow.com/a/61108377
type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;
