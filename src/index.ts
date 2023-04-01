import { client } from './helpers/identification.js';
import { checkEnvironment } from './environment.js';

checkEnvironment();
client.initiate();
