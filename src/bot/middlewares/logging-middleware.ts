import {
  ContextMessageUpdate,
  Middleware as TelegrafMiddlewareFunction,
} from 'telegraf';
import { Middleware } from './middleware.interface';
import winston from 'winston';

/**
 *
 * @TODO why we are returning boolean??
 */
export class LoggingMiddleware implements Middleware {
  constructor(private readonly logger: winston.Logger) {}

  getMiddlewareFunction(): TelegrafMiddlewareFunction<ContextMessageUpdate> {
    return (
      ctx: ContextMessageUpdate,
      next: () => unknown,
    ): unknown | boolean => {
      this.logger.debug(
        `Event ${ctx.updateType}: ${JSON.stringify(ctx.update)}`,
      );

      return next();
    };
  }
}
