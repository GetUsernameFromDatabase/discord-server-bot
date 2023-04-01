interface RequiredEnvironmentVariables {
  DISCORD_CLIENT_ID: string;
  DISCORD_CLIENT_TOKEN: string;
  DISCORD_CLIENT_PUBKEY: string;
  DISCORD_GUILD_ID: string;
  TEST_CHANNEL_ID: string;
  GIVEAWAYS_CHANNEL_ID: string;
}

declare global {
  namespace NodeJS {
    // eslint-disable-next-line unicorn/prevent-abbreviations
    interface ProcessEnv extends RequiredEnvironmentVariables {
      DEV?: boolean;
    }
  }
}

export type RequiredEnvironmentVariablesKeys =
  keyof RequiredEnvironmentVariables;
