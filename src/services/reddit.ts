import {
  ChildrenEntity,
  RedditFetchOptions,
  RedditFetchResponse,
  RedditSortType,
} from '@/reddit.js';
import fetch from 'node-fetch';
import { ApplicationCommandOptionChoice } from 'slash-create';

export const RedditSortTypes: RedditSortType[] = [
  'hot',
  'new',
  'top',
  'rising',
];

export const RedditSortTypeChoices: ApplicationCommandOptionChoice[] =
  RedditSortTypes.map((x) => {
    return { name: x, value: x };
  });

/**
 * Makes a HTTP GET request to retrieve JSON data from a post
 * of the specified subreddit.
 */

/* eslint-disable no-param-reassign */
export default async function redditFetch({
  subreddit,
  sort = 'rising',
  allowNSFW = false,
  allowModeratorPost = false,
  allowVideo = true,
}: RedditFetchOptions) {
  return new Promise<ChildrenEntity[]>(() => {
    subreddit = subreddit.toLowerCase();
    const targetURL = `https://reddit.com/r/${subreddit}.json?sort=${sort}&t=week`;
    console.log(targetURL);

    void fetch(targetURL)
      .then((response) => response.json())
      .then((body) => {
        console.log(body);
        // Array of found posts.
        // Each element should be a large object of returned, unfiltered post data.
        let found = (body as RedditFetchResponse).data.children;

        // Reject if no posts were found.
        // If no post data could be found it's likely that the subreddit does not exist or it has no submissions.

        if (!found || found?.length === 0)
          throw new Error(
            `Unable to find a post. The subreddit "${subreddit}" does not exist, or it has no available post data.`
          );

        // Apply options by filtering the array for data with specific values.
        // These values can be any type, though most commonly boolean.

        found = found.filter((p) => {
          return (
            allowNSFW === p.data.over_18 &&
            allowModeratorPost === Boolean(p.data.distinguished) &&
            allowVideo == p.data.is_video
          );
        });

        if (!allowNSFW) found = found.filter((p) => !p.data.over_18);

        if (!allowModeratorPost)
          found = found.filter((p) => !p.data.distinguished);

        if (!allowVideo) found = found.filter((p) => !p.data.is_video);

        // Reject if the found array has no elements.
        // Nothing was found that suits the options specified.

        if (found.length === 0)
          throw new Error(
            'Unable to find a post that meets specified criteria. There may be an error in the options passed in.'
          );
        // Get a random post object from the array of found data.
        // This data will be resolved and returned through the promise.
        return found;
      });
  });
}
