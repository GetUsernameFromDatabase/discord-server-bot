// eslint-disable-next-line import/unambiguous
module.exports = (api) => {
  const isTest = api.env('test');
  const baseObject = {
    plugins: [
      ['@babel/plugin-proposal-class-properties'],
      // [
      //   '@babel/plugin-transform-runtime',
      //   {
      //     absoluteRuntime: false,
      //     corejs: '3',
      //     version: '^7.14.6',
      //   },
      // ],
    ],
    // presets: [
    //   [
    //     '@babel/preset-env',
    //     {
    //       targets: {
    //         esmodules: true,
    //         node: 'current',
    //       },
    //       modules: false,
    //       useBuiltIns: 'usage',
    //       corejs: { version: '3.14', proposals: true },
    //     },
    //   ],
    // ],
  };

  if (isTest)
    return {
      presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
    };

  return baseObject;
};
