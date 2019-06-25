const steem = require('steem');
const config = require('../config.json');
const { createLogger, format, transports } = require('winston');

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json(),
  ),
  defaultMeta: { service: 'SE_MINING' },
  transports: [
    //
    // - Write to all logs with level `info` and below to `combined.log`
    // - Write all logs error (and below) to `error.log`.
    //
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.File({ filename: 'custom_json.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
  );
}

// steem.api.getBlock(34077381, function(err, blockinfo) {
//   if (err) {
//     console.log('Error', err);
//   }

//   const { timestamp, transactions } = blockinfo;

//   if (transactions.length == 0) return;

//   transactions.forEach(transaction => {
//     const { operations, signatures } = transaction;
//     const action = operations[0][0];
//     const content = operations[0][1];
//     // console.log('action :', action);
//     // console.log('content :', content);

//     if (action === 'voter') {
//     } else if (action === 'transfer') {
//     } else if (action === 'custom_json') {
//       // console.log('action :', action);
//       // console.log('content :', content);
//       logger.info('info', {
//         msg: `Transaction Info==> Action:${action}, content:${content}`,
//       });
//     }
//   });
// });

steem.api.streamBlock(function(err, blockinfo) {
  if (err) {
    console.log('Error', err);
  }

  const { timestamp, transactions } = blockinfo;

  if (transactions.length == 0) return;

  transactions.forEach(transaction => {
    const { operations, signatures } = transaction;
    const action = operations[0][0];
    const content = operations[0][1];
    // console.log('action :', action);
    // console.log('content :', content);

    if (action === 'custom_json') {
      logger.info('info', { title: '=====custom_json======' });
      Object.keys(content).forEach(key => {
        logger.info('info', { content: `key:${key}, content:${content[key]}` });
        // console.log(content[key]);
      });
    }

    // if (action === 'voter') {
    // } else if (action === 'transfer') {
    // } else if (action === 'custom_json') {
    //   // console.log('action :', action);
    //   // console.log('content :', content);
    //   logger.info('info', {
    //     msg: `Transaction Info==> Action:${action}, content:${content}`,
    //   });
    // }
  });
});

// steem.api.streamTransactions(function(err, response) {
//   if (err) {
//     console.log('Error', err);
//   }
//   console.log(response.operations[0][1]);
// });

// steem.api.streamOperations(function(err, response) {
//   if (err) {
//     console.log('Error', err);
//   }
//   console.log(response);
// });
