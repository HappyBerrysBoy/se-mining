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
// steem.broadcast.comment(
//   keyConfig.happyberrysboy_posting,
//   'happyberrysboy', // author
//   'test-20190712', // parent permlink
//   'happyberrysboy', // comment account
//   'test-20190712-sub1', // comment permlink
//   '', // title
//   'comment test', // comment
//   { tags: ['test'], app: '' }, // tags
//   function(err, result) {
//     console.log(err, result);
//   },
// );

//////////////////////// 단체로 보내기 로직
// transfer steem
const sendList = [
  // { name: 'team1p', amount: '0.001 STEEM' },
  // { name: 'anpigon', amount: '0.001 STEEM' },
  // { name: 'lovelyyeon.sct', amount: '0.001 STEEM' },
  // { name: 'sky.min', amount: '0.001 STEEM' },
  // { name: 'sonki999', amount: '0.001 STEEM' },
  // { name: 'june0620', amount: '0.001 STEEM' },
  // { name: 'bluengel', amount: '0.001 STEEM' },
  // { name: 'realprince', amount: '0.001 STEEM' },
  // { name: 'twinpapa.aaa', amount: '0.001 STEEM' },
  // { name: 'feelsogood.cur', amount: '0.001 STEEM' },
  // { name: 'noisysky', amount: '0.001 STEEM' },
  // { name: 'jungjunghoon', amount: '0.001 STEEM' },
  // { name: 'naha', amount: '0.001 STEEM' },
  // { name: 'tinker-bell', amount: '0.001 STEEM' },
];

setInterval(async () => {
  if (sendList.length == 0) return;
  const account = sendList.shift();

  await transferSteem(
    keyConfig.happyberrysboy_active,
    "happyberrysboy",
    account.name,
    `${account.amount}`,
    "이벤트에 참여하여주셔서 감사합니다."
  )
    .then(result => console.log(result))
    .catch(e => console.log(e));
}, 3000);

function transferSteem(wif, from, to, amount, memo) {
  return new Promise((resolve, reject) => {
    steem.broadcast.transfer(wif, from, to, `${amount}`, memo, function(
      err,
      result
    ) {
      // console.log(err, result);
      resolve(result);
    });
  });
}
//////////////////////////////////////////////////////////////////////////////////////

// steem.broadcast.transfer(
//   keyConfig.happyberrysboy_active,
//   'happyberrysboy',
//   'happyberrys.aaa',
//   '1.000 STEEM',
//   'test',
//   function(err, result) {
//     console.log(err, result);
//   },
// );
