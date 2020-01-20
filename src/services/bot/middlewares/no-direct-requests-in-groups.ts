import { Context } from 'telegraf';

/**
 * Middleware, to ensure that request
 * coming from chats, not groups, or request is from
 * private chat.
 * This will not block inline queries when they are
 * performed in other groups or chats.
 *
 * @TODO why we are returning boolean??
 */
export function noDirectRequestsInGroups(
  ctx: Context,
  next: () => any,
): Promise<any> | boolean {
  if (!ctx.chat || ctx.chat.type === 'private') {
    if (typeof next === 'function') {
      return next();
    } else {
      return true;
    }
  } else {
    return false;
  }
}
