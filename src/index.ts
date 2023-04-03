import { CustomClient } from './custom-client';
import './helpers/setup';

const client = new CustomClient();

const main = async () => {
  try {
    client.logger.info('Logging in...');
    return client.login();
  } catch (error) {
    client.logger.fatal(error);
    client.destroy();
    throw error;
  }
};

void main();
