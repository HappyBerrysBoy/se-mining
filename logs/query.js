const winston = require('winston');

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

const options = {
  from: new Date() - 24 * 60 * 60 * 1000,
  until: new Date(),
  limit: 10,
  start: 0,
  order: 'desc',
  fields: ['message'],
};

//
// Find items logged between today and yesterday.
//
logger.query(options, function(err, results) {
  if (err) {
    /* TODO: handle me */
    throw err;
  }

  console.log(results);
});
