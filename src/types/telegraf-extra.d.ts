import 'telegraf';

declare module 'telegraf' {
  /**
   * Telegraf misses these properties in its type definitions.
   */
  interface Extra {
    reply_to_message_id?: number;
    disable_notification?: boolean;
    disable_web_page_preview?: boolean;
    parse_mode?: import('telegraf/typings/telegram-types').ParseMode;
  }
}
