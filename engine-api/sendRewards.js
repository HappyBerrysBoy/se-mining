const steem = require("steem");
const scotAPI = require("./scotPoolAPI");
let toAccount = ["uni.dev"];
const key = require("../key.json");
const amount = "0.01";
const symbol = "SCT";
const sender = "uni.dev";
const author = "happyberrysboy";
const permlink = "happyberrysboy-mining-report-2019-08-02";
const activekey = key.uni_dev_active;

function sendTokenPromise(account, sym, amo) {
  return new Promise((resolve, reject) => {
    let jsonStr = {
      contractName: "tokens",
      contractAction: "transfer",
      contractPayload: {
        symbol: sym,
        to: account,
        quantity: amo,
        type: "scot-thumbup",
        author: author,
        permlink: permlink,
        sender: sender,
        memo: ""
      }
    };

    // id: "ssc-mainnet1";
    // json:"{"contractName":"tokens","contractAction":"transfer","contractPayload":{"symbol":"GG","to":"doggodfroglog","quantity":"2.5","memo":"Daily Earnings for your Delegation. Thank you!"}}"

    let json = JSON.stringify(jsonStr);

    steem.broadcast.customJson(
      activekey,
      [sender],
      [],
      "ssc-mainnet1",
      json,
      function(err, result) {
        // Json{"contractName":"tokens","contractAction":"transfer","contractPayload":
        // {"symbol":"SCT","to":"scotpool.miner","quantity":"0.001","memo":"test"}}

        if (result != null) {
          console.log(result);
        } else {
          console.log(err);
        }
      }
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
