const path = require('path');
const { createConfig } = require('@openedx/frontend-build');
const CopyPlugin = require('copy-webpack-plugin');

const config = createConfig('webpack-prod');

config.plugins.push(
  new CopyPlugin({
    patterns: [
      {
        from: path.resolve(__dirname, './public/static'),
        to: path.resolve(__dirname, './dist/static'),
      },
    ],
  }),
);

config.resolve.alias = {
  ...config.resolve.alias,
  '@src': path.resolve(__dirname, 'src'),
};

// Suppress Sass deprecation warnings
config.module.rules.forEach((rule) => {
  if (rule.test && rule.test.toString().includes('scss')) {
    rule.use.forEach((loader) => {
      if (loader.loader && loader.loader.includes('sass-loader')) {
        loader.options = {
          ...loader.options,
          sassOptions: {
            ...loader.options?.sassOptions,
            quietDeps: true, // Suppress deprecation warnings from dependencies
            verbose: false,
          },
          warnRuleAsWarning: false, // Don't show sass warnings as webpack warnings
        };
      }
    });
  }
});

module.exports = config;
