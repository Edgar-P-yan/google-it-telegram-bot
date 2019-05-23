/**
 * Middleware, to ensure that request
 * coming from private chat.
 */
module.exports = async ({ chat }, next) => {
  if (chat.type === 'private') {
    if (typeof next === 'function') {
      next();
    } else {
      return true;
    }
  } else {
    return false;
  }
};
