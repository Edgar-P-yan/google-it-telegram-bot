const dotenv = require('dotenv');
const debug = require('debug')('app:config-env');

module.exports = function config() {
  if (process.env.NODE_ENV !== 'production') {
    const result = dotenv.config();
    if (result.error) {
      debug(result.error);
    }
  }
};
