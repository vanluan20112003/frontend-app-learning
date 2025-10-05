const path = require('path');
const { createConfig } = require('@openedx/frontend-build');

const config = createConfig('webpack-dev');

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
            logger: {
              warn: () => {}, // Completely silence all Sass warnings
            },
          },
          warnRuleAsWarning: false, // Don't show sass warnings as webpack warnings
        };
      }
    });
  }
});

// Filter out Sass warnings from stats
const originalStats = config.stats || {};
config.stats = {
  ...originalStats,
  warningsFilter: [
    /Deprecation.*Sass/i,
    /legacy JS API/i,
    /@import.*deprecated/i,
    /Global built-in functions/i,
  ],
};

module.exports = config;
