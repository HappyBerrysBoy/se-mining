const winston = require('winston');
require('winston-daily-rotate-file');
const moment = require('moment');

// const logger = new winston.createLogger({
//   transports: [
//     new winston.transports.Console({
//       level: 'debug',
//       format: winston.format.printf(
//         info => `${moment().format('YYYY-MM-DD HH:mm:ss')} - ${info.message}`,
//       ),
//     }),
//     new winston.transports.DailyRotateFile({
//       level: 'debug',
//       filename: 'logs/system.log', // log 폴더에 system.log 이름으로 저장
//       zippedArchive: true, // 압축여부
//       handleExceptions: true,
//       format: winston.format.printf(
//         info => `${moment().format('YYYY-MM-DD HH:mm:ss')} - ${info.message}`,
//       ),
//     }),
//   ],
// });

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  // defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({
      filename: 'logs/system.log',
      format: winston.format.printf(
        info => `${moment().format('YYYY-MM-DD HH:mm:ss')} - ${info.message}`,
      ),
    }),
  ],
});

module.exports = logger;
