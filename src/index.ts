import { CustomClient } from './custom-client';

async function main() {
  const client = new CustomClient();

  try {
    client.logger.info('Logging in...');
    // automatically taken from process.env.DISCORD_TOKEN
    // see node_modules\discord.js\src\client\Client.js:152 "discord.js": "^14.14.1"
    await client.login();
  } catch (error) {
    client.logger.fatal(error);
    await client.destroy();
    throw error;
  }
}

void main();
