/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { TGenericJobs } from '@t/jobs';
import type { BaseCronJob } from './base.js';

interface TJobs extends TGenericJobs {
  Giveaways: { [K in keyof typeof Giveaways]: BaseCronJob };
}
export const jobs = { Giveaways: {} } as TJobs;

// @index(['./**/*.ts', /base/gi], (f, _) => {const a = _.pascalCase(f.name); return `import * as ${a} from '${f.path}.js';\nfor (const [key, value] of Object.entries(${a}))\n  if (typeof value === 'function')\n    jobs.${a}[key as keyof typeof Giveaways] = new value();`})
import * as Giveaways from './giveaways.js';
for (const [key, value] of Object.entries(Giveaways))
  if (typeof value === 'function')
    jobs.Giveaways[key as keyof typeof Giveaways] = new value();
// @endindex

export function StartJobs() {
  for (const jobCategory of Object.values(jobs))
    for (const job of Object.values(jobCategory)) job.start();
}
