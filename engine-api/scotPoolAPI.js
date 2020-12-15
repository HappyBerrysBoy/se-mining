const SSC = require("sscjs");
const steem = require("steem");
const getJSON = require("get-json");

const ssc = new SSC("https://steemapi.cryptoempirebot.com/rpc/");

/**
 * pending claim token 개수 확인
 */
module.exports.checkPendingClaim = async function (account, symbol) {
  let url = "https://scot-api.cryptoempirebot.com/@" + account;

  let pendingToken = await getJSON(url);
  let tokens = await ssc.findOne("tokens", "tokens", { symbol: symbol });

  return pendingToken[symbol].pending_token / 10 ** tokens.precision;
};

/**
 * claim rewards
 * customjson 호출
 */
module.exports.claimRewards = async function (wif, account, symbol) {
  let jsonStr = { symbol: symbol };
  let json = JSON.stringify(jsonStr);

  // steem api 호출
  let rtn = steem.broadcast.customJson(
    wif,
    [],
    [account],
    "scot_claim_token",
    json,
    function (err, result) {
      if (result != null) console.log(result);
    }
  );
};

module.exports.getTokenBalances = async function (account, symbol) {
  let result = await ssc.findOne("tokens", "balances", {
    account: account,
    symbol: symbol,
  });

  if (result != null) {
    return result.balance;
  } else {
    return 0;
  }
};

module.exports.stakeToken = async function (wif, account, symbol, amount) {
  let jsonStr = {
    contractName: "tokens",
    contractAction: "stake",
    contractPayload: { to: account, symbol: symbol, quantity: amount },
  };
  let json = JSON.stringify(jsonStr);

  steem.broadcast.customJson(
    wif,
    [account],
    [],
    "ssc-mainnet1",
    json,
    function (err, result) {
      if (result != null) {
        console.log(result);
      } else {
        console.log(err);
      }
    }
  );
};

module.exports.transferToken = async function (
  wif,
  account,
  symbol,
  to,
  amount,
  memo
) {
  let jsonStr = {
    contractName: "tokens",
    contractAction: "transfer",
    contractPayload: { symbol: symbol, to: to, quantity: amount, memo: memo },
  };

  let json = JSON.stringify(jsonStr);

  steem.broadcast.customJson(
    wif,
    [account],
    [],
    "ssc-mainnet1",
    json,
    function (err, result) {
      // Required Auths["honeybeerbear"]
      // Required Posting Auths[]
      // Idssc-mainnet1
      // Json{"contractName":"tokens","contractAction":"transfer","contractPayload":
      // {"symbol":"SCT","to":"scotpool.miner","quantity":"0.001","memo":"test"}}

      if (result != null) {
        console.log(result);
      } else {
        console.log(err);
      }
    }
  );
};
