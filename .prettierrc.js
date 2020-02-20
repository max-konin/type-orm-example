module.exports = {
  singleQuote: true,
  tabWidth: 2,
  overrides: [
    {
      files: '*.json',
      options: {
        parser: 'json',
      },
    },
  ],
};
