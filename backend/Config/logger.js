const fs = require('fs');
const { format } = require('winston');
const winston = require('winston');
require('winston-daily-rotate-file');

const LOG_DIR = process.env.LOG_DIR || 'Logs';
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR);
}

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      format: format.combine(
        format.colorize(),
        format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.align(),
        format.printf(
          info => `${info.timestamp} ${info.level}: ${info.message}`
        )
      ),
      level: LOG_LEVEL
    }),
    new winston.transports.File({
      format: format.combine(
        format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.align(),
        format.printf(
          info => `${info.timestamp} ${info.level}: ${info.message}`
        )
      ),
      level: LOG_LEVEL,
      filename: 'logs/audit-log.log',
      maxsize: 1000000,
      maxFiles: 15
    }),
    new winston.transports.DailyRotateFile({
      format: format.combine(
        format.timestamp(),
        format.align(),
        format.printf(
          info => `${info.timestamp} ${info.level}: ${info.message}`
        )
      ),
      maxFiles: '30d',
      dirname: LOG_DIR,
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      filename: '%DATE%.log',
      level: LOG_LEVEL
    })
  ]
});

module.exports = logger;
