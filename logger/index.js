const winston = require('winston');

const logger = winston.createLogger({
  format: winston.format.combine(
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
  level: 'error',
  transports: [
    new winston.transports.File({
      filename: 'logs/errors.log',
      level: 'error',
    }),
  ],
});

if (process.env.NODE_ENV === 'development') {
  logger.transports.push(
    new winston.transports.Console({
      format: winston.format.simple(),
      level: 'error',
    }),
  );
}

module.exports = logger;
