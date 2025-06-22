module.exports = {
  style: {
    postcss: {
      // Let postcss.config.js handle the plugins
      loaderOptions: (postcssLoaderOptions) => {
        return postcssLoaderOptions;
      },
    },
  },
};
