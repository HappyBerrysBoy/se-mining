const steem = require('steem');
const scotAPI = require('./scotPoolAPI');
let toAccount = [
  'gfriend96',
  'kiwipie',
  'newbijohn',
  'banguri',
  'naha',
  'jinuking',
  'fur2002ks',
  'isi3.sct',
  'jcarvoting',
  'gooehello',
  'donekim',
  'sweetpapa',
  'peterpa',
  'mimistar',
  'relaxkim',
  'kstop1',
  'epitt925',
  'tinker-bell',
  'ldh1109',
  'skymin',
  'tradingideas',
  'hyokhyok',
  'kingsguards',
  'blockchainstudio',
];
const amount = '500';
const symbol = 'AAA';

function sendTokenPromise(account, sym, amo) {
  return new Promise((resolve, reject) => {
    let jsonStr = {
      contractName: 'tokens',
      contractAction: 'transfer',
      contractPayload: {
        symbol: sym,
        to: account,
        quantity: amo,
        memo: '',
      },
    };

    let json = JSON.stringify(jsonStr);

    steem.broadcast.customJson(
      'activekey',
      ['happyberrysboy'],
      [],
      'ssc-mainnet1',
      json,
      function(err, result) {
        // Json{"contractName":"tokens","contractAction":"transfer","contractPayload":
        // {"symbol":"SCT","to":"scotpool.miner","quantity":"0.001","memo":"test"}}

        if (result != null) {
          console.log(result);
        } else {
          console.log(err);
        }
      },
    );
    resolve();
  });
}

for (let i = 0; i < toAccount.length; i++) {
  const account = toAccount[i];
  sendTokenPromise(account, symbol, amount).then(() => {
    console.log(`To ${account} ${amount}${symbol}`);
  });
}
