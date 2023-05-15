import winston from 'winston';
import { Namespace } from 'cls-hooked';
import _ from 'lodash';
import { ContextMessageUpdate } from 'telegraf';

export const addBotContextFromCls: TAddBotContextFromClsWrap = winston.format(
  (info, opts: IAddBotContextFromCls) => {
    const botContext = opts.clsNs.get('bot_context') as ContextMessageUpdate;
    // When ContextMessageUpdate has private 'tg' property
    // which appears in logs, so we remove it here.
    // 'botInfo' is just redundant, so we just remove it.
    info['bot_context'] = _.omit(botContext, ['tg', 'botInfo']);
    return info;
  },
);

/**
 * winston does not export these internal types,
 * so we fetch them through ReturnType
 */
export type TWinstonFormatWrap = ReturnType<typeof winston.format>;
export type TWinstonFormat = ReturnType<TWinstonFormatWrap>;

/**
 * after we got type Format we can create custom
 * FormatWrap type, with strongly typed opts argument
 */
export type TAddBotContextFromClsWrap = (
  opts: IAddBotContextFromCls,
) => TWinstonFormat;

export interface IAddBotContextFromCls {
  clsNs: Namespace;
}
