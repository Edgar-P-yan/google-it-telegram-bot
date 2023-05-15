import {
  ContextMessageUpdate,
  Middleware as TelegrafMiddlewareFunction,
} from 'telegraf';

export interface Middleware {
  getMiddlewareFunction(): TelegrafMiddlewareFunction<ContextMessageUpdate>;
}
