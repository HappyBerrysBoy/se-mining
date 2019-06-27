const steem = require('steem');
const keyConfig = require('../key.json');
const config = require('../config.json');

const post = '5KBxjwEDaLdxJ1DJAC6VJdMgHqoLe8srWXjV8dGG9MyZVQQsMZR';

// 성공
// Nextcolony Build Ship
// steem.broadcast.customJson(
//   post, // posting key
//   [],
//   ['happyberrysboy'], // account
//   'nextcolony', // 'nextcolony'
//   `{"username":"happyberrysboy","type":"buildship","command":{"tr_var1":"P-ZA01QNQO29C","tr_var2":"explorership"}}`, // content json stringfy
//   function(err, result) {
//     console.log(err, result);
//   },
// );

// Nextcolony Explore
steem.broadcast.customJson(
  post, // posting key
  [],
  ['happyberrysboy'], // account
  'nextcolony', // 'nextcolony'
  `{"username":"happyberrysboy","type":"explorespace","command":{"tr_var1":"P-ZA01QNQO29C","tr_var2":"-7","tr_var3":"-179"}}`, // content json stringfy
  function(err, result) {
    console.log(err, result);
  },
);
