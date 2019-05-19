const dotenv = require('dotenv');

module.exports = function config() {
  const result = dotenv.config({
    path:
      process.env.ENV && process.env.ENV.toLowerCase().trim() === 'heroku'
        ? './.heroku.env'
        : './.env',
  });
  if (result.error) {
    throw result.error;
  }
  return result;
};
