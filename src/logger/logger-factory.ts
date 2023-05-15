import winston from 'winston';
import { ClsNS } from '../cls-ns/cls-ns-factory';
import { addMetadataFromCls } from './add-metadata-from-cls';

export class LoggerFactory {
  constructor(
    private readonly clsNs: ClsNS,
    private readonly loggingLevel: string,
  ) {}

  get(context?: string): winston.Logger {
    const transports = [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.label({ label: context, message: true }),
          winston.format.cli(),
        ),
      }),
      new winston.transports.File({
        maxsize: 10 * 2 ** 20, // 10 Megabytes
        maxFiles: 100, // so log files will not be greater then 1 GB
        zippedArchive: true,
        filename: 'logs/combined.log',
      }),
    ];

    const logger = winston.createLogger({
      level: this.loggingLevel,
      defaultMeta: {
        context,
      },
      format: winston.format.combine(
        addMetadataFromCls({
          clsNs: this.clsNs.get(),
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
}
