const name = 'discord_server_bot'

// Beats having pm2 in dependencies
// ! make sure to update using https://github.com/Unitech/pm2/blob/master/types/index.d.ts
/** @type {import('./@types/pm2').StartOptions[]} */
const apps = [
  {
    name: name,
    script: 'yarn',
    args: 'start:pm2',
    output: './log.log',
    error: './error.log',
    watch: 'src',
    // these folders should be taken care of by [sapphire HMR plugin](https://www.npmjs.com/package/@sapphire/plugin-hmr)
    ignore_watch: ['src/commands', 'src/listeners', 'src/preconditions'],
    source_map_support: true,
    restart_delay: 30_000,
    min_uptime: 30_000
  },
  {
    name: name + '_updater',
    script: 'updater.sh',
    cron: "30 */6 * * *",
    autorestart: false,
  }
];
module.exports = {
  apps,
};
