import * as Messaging from '../src/Messaging.js';

test('Messaging.MdHAsEmbedFieldTitle', () => {
  expect.assertions(1);
  const testFunction = Messaging.testPrivate.MdHAsEmbedFieldTitle;
  const testInput = `This giveaway is for GOG, its a platform for distributing games, similar to steam and others

- Go to the giveaway page
- https://www.gog.com/#giveaway
- Login or make an account if you do not have one
- Scroll down until you see the Hellpoint banner
- Wait for the Hellpoint banner to load (it may take some time)
- Click on the "Yes, and claim the game" button
- Thats it, the game wil be added to your library

####YOOOOO
aaaa
#Hmm
`;
  const expectedResult = [
    {
      name: '​',
      value:
        'This giveaway is for GOG, its a platform for distributing games, similar to steam and others\n' +
        '\n' +
        '- Go to the giveaway page\n' +
        '- https://www.gog.com/#giveaway\n' +
        '- Login or make an account if you do not have one\n' +
        '- Scroll down until you see the Hellpoint banner\n' +
        '- Wait for the Hellpoint banner to load (it may take some time)\n' +
        '- Click on the "Yes, and claim the game" button\n' +
        '- Thats it, the game wil be added to your library\n' +
        '\n',
      inline: false,
    },
    { name: '####YOOOOO', value: 'aaaa\n', inline: false },
    { name: '#Hmm', value: '​', inline: false },
  ];

  const testResult = testFunction([testInput]);
  expect(testResult).toStrictEqual(expectedResult);
});
