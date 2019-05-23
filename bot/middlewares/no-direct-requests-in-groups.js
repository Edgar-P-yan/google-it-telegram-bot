/**
 * Middleware, to ensure that request
 * coming from chats, not groups, or request is from
 * private chat.
 * This will not block inline queries when they are
 * performed in other groups or chats.
 */
module.exports = async (ctx, next) => {
  if (typeof ctx.chat === 'undefined' || ctx.chat.type === 'private') {
    if (typeof next === 'function') {
      next();
    } else {
      return true;
    }
  } else {
    return false;
  }
};
