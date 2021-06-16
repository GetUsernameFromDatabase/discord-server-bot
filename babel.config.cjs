/* eslint-disable unicorn/prefer-module */
/* eslint-disable import/no-commonjs */
// {
//   "plugins": [
//     ["@babel/plugin-proposal-class-properties"],
//     [
//       "@babel/plugin-transform-runtime",
//       {
//         "corejs": "3",
//         "version": "^7.14"
//       }
//     ],
//     ["babel-plugin-flow-to-typescript"]
//   ],
//   "presets": [
//     [
//       "@babel/preset-env",
//       {
//         "targets": {
//           "node": "current",
//           "esmodules": true
//         },
//         "modules": false,
//         "useBuiltIns": "usage",
//         "corejs": { "version": "3.12.1", "proposals": true }
//       }
//     ],
//     ["airbnb", { "runtimeVersion": "^7.14" }]
//   ]
// }

// eslint-disable-next-line import/unambiguous, no-undef
module.exports = (api) => {
  const isTest = api.env('test');
  const baseObject = {
    plugins: [
      ['@babel/plugin-proposal-class-properties'],
      [
        '@babel/plugin-transform-runtime',
        {
          corejs: '3',
          version: '^7.14',
        },
      ],
    ],
    presets: [
      [
        '@babel/preset-env',
        {
          targets: {
            node: 'current',
            esmodules: true,
          },
          modules: false,
          useBuiltIns: 'usage',
          corejs: { version: '3.12.1', proposals: true },
        },
      ],
    ],
  };

  if (isTest)
    return {
      presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
    };

  return baseObject;
};
