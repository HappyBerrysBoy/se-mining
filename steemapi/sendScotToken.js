const steem = require("steem");
const keyConfig = require("../key.json");
const config = require("../config.json");
// const { createLogger, format, transports } = require('winston');

// const logger = createLogger({
//   level: 'info',
//   format: format.combine(
//     format.timestamp({
//       format: 'YYYY-MM-DD HH:mm:ss',
//     }),
//     format.errors({ stack: true }),
//     format.splat(),
//     format.json(),
//   ),
//   defaultMeta: { service: 'SE_MINING' },
//   transports: [
//     //
//     // - Write to all logs with level `info` and below to `combined.log`
//     // - Write all logs error (and below) to `error.log`.
//     //
//     new transports.File({ filename: 'error.log', level: 'error' }),
//     new transports.File({ filename: 'custom_json.log' }),
//   ],
// });

// if (process.env.NODE_ENV !== 'production') {
//   logger.add(
//     new transports.Console({
//       format: format.combine(format.colorize(), format.simple()),
//     }),
//   );
// }

// 성공
// token claim
// const jsonStr = [{ symbol: "SCT" }];
// steem.broadcast.customJson(
//   keyConfig.scotminer_posting,
//   [],
//   [keyConfig.scotminer_account],
//   "scot_claim_token",
//   JSON.stringify(jsonStr),
//   function(err, result) {
//     console.log(err, result);
//   }
// );

// steem posting
// steem.broadcast.comment(
//   keyConfig.happyberrysboy_posting, // posting wif
//   "", // author, leave blank for new post
//   "sct", // first tag
//   "happyberrysboy", // username
//   "test-20190712", // permlink
//   "test", // Title
//   "tteesstt", // Body of post
//   // json metadata (additional tags, app name, etc)
//   { tags: ["test"], app: "" },
//   function(err, result) {
//     if (err) {
//       console.log(err);
//       return;
//     }

//     console.log(result);
//   }
// );

// comment
steem.broadcast.comment(
  keyConfig.happyberrysboy_posting,
  "happyberrysboy", // author
  "test-20190712", // parent permlink
  "happyberrysboy", // comment account
  "test-20190712-sub1", // comment permlink
  "", // title
  "comment test", // comment
  { tags: ["test"], app: "" }, // tags
  function(err, result) {
    console.log(err, result);
  }
);
