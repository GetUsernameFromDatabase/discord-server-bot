import type { BaseCronJob } from '../src/jobs/base';

export interface TGenericJobs {
  [jobCategory: string]: {
    [jobName: string]: BaseCronJob;
  };
}
