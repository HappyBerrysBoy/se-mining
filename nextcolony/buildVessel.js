const steem = require('steem');
const key = require('../key.json');

// 성공
// Nextcolony Build Ship
steem.broadcast.customJson(
  key.happyberrysboy_posting, // posting key
  [],
  ['happyberrysboy'], // account
  'nextcolony', // 'nextcolony'
  `{"username":"happyberrysboy","type":"buildship","command":{"tr_var1":"P-ZA01QNQO29C","tr_var2":"explorership"}}`, // content json stringfy
  function(err, result) {
    console.log(err, result);
  },
);

// Nextcolony Explore
// steem.broadcast.customJson(
//   key.happyberrysboy_posting, // posting key
//   [],
//   ["happyberrysboy"], // account
//   "nextcolony", // 'nextcolony'
//   `{"username":"happyberrysboy","type":"explorespace","command":{"tr_var1":"P-ZA01QNQO29C","tr_var2":"-5","tr_var3":"-177"}}`, // content json stringfy
//   function(err, result) {
//     console.log(err, result);
//   }
// );
