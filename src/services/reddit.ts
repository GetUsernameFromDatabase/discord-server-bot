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
export const RedditSortTypeChoices: ApplicationCommandOptionChoice[] = [
  { name: 'hot', value: RedditSortTypes[0] },
  { name: 'new', value: RedditSortTypes[1] },
  { name: 'top', value: RedditSortTypes[2] },
  { name: 'rising', value: RedditSortTypes[3] },
];

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
    // Check the required 'subreddit' argument.
    // This argument must be given for the fetch to work.
    if (!subreddit) throw new Error('Missing required argument "subreddit"');

    // Validate the remaining options.
    // Ideally, all of these should be passed in as booleans.

    // SUBREDDIT
    if (typeof subreddit !== 'string')
      throw new TypeError(
        `Expected type "string" but got "${typeof subreddit}"`
      );

    // SORT
    if (sort && typeof sort !== 'string')
      new TypeError(`Expected type "string" but got "${typeof sort}"`);

    if (RedditSortTypes.includes(sort)) {
      const allowedTypeMessage = `*${RedditSortTypes.join('*, ')}*`;
      const errorResponse = `Wrong type used\nAllowed types are -- ${allowedTypeMessage}`;
      throw new Error(errorResponse);
    }

    // ALLOW NSFW
    if (allowNSFW && typeof allowNSFW !== 'boolean')
      throw new TypeError(
        `Expected type "boolean" but got "${typeof allowNSFW}"`
      );

    // ALLOW MOD POST
    if (allowModeratorPost && typeof allowModeratorPost !== 'boolean')
      throw new TypeError(
        `Expected type "boolean" but got "${typeof allowModeratorPost}"`
      );

    // ALLOW VIDEO
    if (allowVideo && typeof allowVideo !== 'boolean')
      throw new TypeError(
        `Expected type "boolean" but got "${typeof allowVideo}"`
      );

    // Convert sorting option & subreddit option to lowercase.
    // This is primarily for the target URL to make the request to.

    sort = sort.toLowerCase() as RedditSortType;
    subreddit = subreddit.toLowerCase();

    // Target URL for the GET request
    // This is where the main fetch function will grab data.

    const targetURL = `https://reddit.com/r/${subreddit}.json?sort=${sort}&t=week`;

    void fetch(targetURL)
      .then((response) => response.json())
      .then((body) => {
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
