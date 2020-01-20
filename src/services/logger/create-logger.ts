import winston from 'winston';
import { addMetadataFromCls } from './lib/add-metadata-from-cls';
import { botClsNs } from '../../lib/bot-cls-ns';

export function createLogger(context?: string): winston.Logger {
  const transports =
    process.env.NODE_ENV === 'production'
      ? [new winston.transports.Console()]
      : [
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.label({ label: context, message: true }),
              winston.format.cli(),
            ),
          }),
          new winston.transports.File({
            filename: 'logs/combined.log',
          }),
        ];

  const logger = winston.createLogger({
    defaultMeta: {
      context,
    },
    format: winston.format.combine(
      addMetadataFromCls({
        clsNs: botClsNs,
        clsProp: 'bot_context',
        metadataProp: 'bot_context',
      }),
      winston.format.timestamp(),

      // this serializes errors, usage logger.error({error: error})
      winston.format.json({
        replacer(key, val) {
          if (key === 'error') {
            return {
              message: val.message,
              name: val.name,
              stack: val.stack,
              code: val.code,
            };
          }
          return val;
        },
      }),
    ),
    transports,
  });

  return logger;
}
