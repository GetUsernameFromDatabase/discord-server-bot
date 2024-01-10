import { CustomClient } from './custom-client';

async function main() {
  const client = new CustomClient();

  try {
    client.logger.info('Logging in...');
    return client.login();
  } catch (error) {
    client.logger.fatal(error);
    await client.destroy();
    throw error;
  }
}

void main();
