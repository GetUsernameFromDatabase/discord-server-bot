/* eslint-disable import/unambiguous */
module.exports = (api) => {
  const isTest = api.env('test');
  const baseObject = {
    plugins: [['@babel/plugin-proposal-class-properties']],
    presets: [
      [
        '@babel/preset-env',
        {
          targets: {
            node: 'current',
          },
          modules: false,
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
