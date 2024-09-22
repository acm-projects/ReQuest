module.exports = function (api) {
  api.cache(true);

  return {
    presets: ['babel-preset-expo'],
    //if having issues with this follow the link on frontend slack channel
    // to see how to add tailwindcss through terminal
    plugins: ["nativewind/babel"],
  };
};
