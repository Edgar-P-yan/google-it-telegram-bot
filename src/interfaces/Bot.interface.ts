import Telegraf, { ContextMessageUpdate } from "telegraf";

export interface IBot {
  bot: Telegraf<ContextMessageUpdate>
}
