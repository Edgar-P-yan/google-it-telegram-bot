import { ContextMessageUpdate } from 'telegraf';

export namespace NSBotInlineQueryHandlers {
  export interface IInlineQueryHandler {
    handler(ctx: ContextMessageUpdate): Promise<void>;
  }

  export interface ISpecificSearchTypeHandler {
    handle(query: string, ctx: ContextMessageUpdate): Promise<void>;
  }
}
