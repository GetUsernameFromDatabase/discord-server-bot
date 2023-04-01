/* eslint-disable no-console */
/* eslint-disable jest/no-commented-out-tests */
import RedditFetch from '../src/services/reddit.js';

test('hot', async () => {
  expect.assertions(1);
  const reddit = await RedditFetch({
    subreddit: 'Memes_Of_The_Dank',
    sort: 'hot',
  });

  console.error(reddit);
  expect(reddit).toBeDefined();
});

// test('new', () => {
//   expect.assertions(1);
//   const reddit = new Reddit('Memes_Of_The_Dank', 'new');
// });

// test('top', () => {
//   expect.assertions(1);
//   const reddit = new Reddit('Memes_Of_The_Dank', 'top');
// });

// test('rising', () => {
//   expect.assertions(1);
//   const reddit = new Reddit('Memes_Of_The_Dank', 'rising');
// });
