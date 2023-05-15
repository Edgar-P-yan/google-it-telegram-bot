import {
  ContextMessageUpdate,
  Middleware as TelegrafMiddlewareFunction,
} from 'telegraf';
import { Middleware } from './middleware.interface';

/**
 * Middleware, to ensure that request
 * coming from chats, not groups, or request is from
 * private chat.
 * This will not block inline queries when they are
 * performed in other groups or chats.
 *
 * @TODO why we are returning boolean??
 */
export class NoDirectRequestsInGroupsMiddleware implements Middleware {
  getMiddlewareFunction(): TelegrafMiddlewareFunction<ContextMessageUpdate> {
    return function noDirectRequestsInGroups(
      ctx: ContextMessageUpdate,
      next: () => unknown,
    ): unknown | boolean {
      if (!ctx.chat || ctx.chat.type === 'private') {
        if (typeof next === 'function') {
          return next();
        } else {
          return true;
        }
      } else {
        return false;
      }
    };
  }
}
