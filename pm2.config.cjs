const name = 'discord_server_bot'
/** @type {import('pm2').StartOptions[]} */
const apps = [
  {
    name: name,
    script: 'yarn',
    args: 'start:watch',
    output: './log.log',
    error: './error.log',
    watch: 'src',
    source_map_support: true,
    min_uptime: 30_000
  },
  {
    name: name + '_updater',
    script: 'updater.sh',
    cron: "00 * * * *",
    autorestart: false,
  }
];
module.exports = {
  apps,
};
