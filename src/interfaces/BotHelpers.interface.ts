import { ContextMessageUpdate } from 'telegraf';

export interface IBotHelpers {
  sendNothingFound(ctx: ContextMessageUpdate, cacheTime: number): Promise<void>;

  sendErrorResult(ctx: ContextMessageUpdate): Promise<void>;
}
