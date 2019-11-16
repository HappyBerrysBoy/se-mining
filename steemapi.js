const SSC = require("sscjs");
const steem = require("steem");
const axios = require("axios");
const getJSON = require("get-json");

const ssc = new SSC("https://api.steem-engine.com/rpc/");

async function callApi(url, params) {
  return await axios({
    url,
    method: "GET",
    params
  })
    .then(response => {
      return response.data;
    })
    .catch(err => {
      console.error(`Could not fetch data, url: ${url}`);
      return {};
    });
}

async function getScotHolder(symbol, cnt, offset) {
  return new Promise((resolve, reject) => {
    let holders = new Array();
    ssc.find(
      "tokens",
      "balances",
      { symbol: symbol },
      cnt,
      offset,
      [],
      async (err, results) => {
        if (err) {
          reject(err);
          return;
        }

        for (const result of results) {
          holders.push(result);
        }

        if (results.length == cnt) {
          const holder = await getScotHolder(symbol, cnt, offset + cnt);
          for (const result of holder) {
            holders.push(result);
          }
        }

        resolve(holders);
      }
    );
  });
}

const steemapi = {
  decimalFloor: (num, digit) => {
    return Math.floor(num * Math.pow(10, digit)) / Math.pow(10, digit);
  },
  getAccount: author => {
    return new Promise((resolve, reject) => {
      steem.api.getAccounts([author], (err, data) => {
        if (err) {
          resolve(null);
          return;
        }

        if (!data.length) {
          resolve("NONE");
          return;
        }

        data[0].reputation = steem.formatter.reputation(data[0].reputation);
        resolve(data[0]);
      });
    });
  },
  getContent: (author, permlink) => {
    return new Promise((resolve, reject) => {
      steem.api.getContent(author, permlink, (err, result) => {
        if (err) {
          reject(new Error(`Fail to load getContent(${author}, ${permlink})`));
          return;
        }

        if (!result.body.length) {
          reject(new Error(`Invalid permlink(${author}, ${permlink})`));
          return;
        }

        resolve(result);
      });
    });
  },
  transferSTEEM: (activekey, from, to, amount, memo) => {
    return new Promise((resolve, reject) => {
      steem.broadcast.transfer(
        activekey,
        from,
        to,
        amount + " STEEM",
        memo,
        function(err, result) {
          if (err) {
            console.log(err);
            reject(err);
            return;
          }
          resolve(result);
        }
      );
    });
  },
  transferSBD: (activekey, from, to, amount, memo) => {
    return new Promise((resolve, reject) => {
      steem.broadcast.transfer(
        activekey,
        from,
        to,
        amount + " SBD",
        memo,
        function(err, result) {
          if (err) {
            console.log(err);
            reject(err);
            return;
          }
          resolve(result);
        }
      );
    });
  },
  transferToken: (activekey, account, json) => {
    return new Promise((resolve, reject) => {
      steem.broadcast.customJson(
        activekey,
        [account],
        [],
        "ssc-mainnet1",
        JSON.stringify(json),
        function(err, result) {
          if (err) {
            console.log(err);
            reject(err);
            return;
          }

          // console.log(result);
          resolve(result);
        }
      );
    });
  },
  getPriceApi: () => {
    return callApi("https://apisct.cloud/price/");
  },
  getScotDataAsync: (path, params) => {
    return callApi(`https://scot-api.steem-engine.com/${path}`, params);
  },
  getScotTokenTransferAsync: params => {
    return callApi(`https://api.steem-engine.com/accounts/history`, params);
  },
  getScotPrice: () => {
    return callApi("https://apisct.cloud/price");
  },
  getSteemPrice: () => {
    return callApi(
      "https://crix-api-endpoint.upbit.com/v1/crix/candles/lines?code=CRIX.UPBIT.KRW-STEEM"
    );
  },
  getSbdPrice: () => {
    return callApi(
      "https://crix-api-endpoint.upbit.com/v1/crix/candles/lines?code=CRIX.UPBIT.KRW-SBD"
    );
  },
  claimRewards: (wif, account, symbol) => {
    return new Promise((resolve, reject) => {
      let jsonStr = { symbol: symbol };
      let json = JSON.stringify(jsonStr);

      // steem api 호출
      let rtn = steem.broadcast.customJson(
        wif,
        [],
        [account],
        "scot_claim_token",
        json,
        function(err, result) {
          if (err) {
            // console.log(err);
            reject(err);
            return;
          }

          // console.log(result);
          resolve(result);
        }
      );
    });
  },
  checkPendingClaim: async (account, symbol) => {
    let url = "https://scot-api.steem-engine.com/@" + account;

    let pendingToken = await getJSON(url);
    let tokens = await ssc.findOne("tokens", "tokens", { symbol: symbol });

    return pendingToken[symbol].pending_token / 10 ** tokens.precision;
  },
  getTokenBalances: async (account, symbol) => {
    try {
      let result = await ssc.findOne("tokens", "balances", {
        account: account,
        symbol: symbol
      });

      if (result != null) {
        return result;
      } else {
        return 0;
      }
    } catch (error) {
      return undefined;
    }
  },
  getDelegationToken: async (account, symbol) => {
    let result = await ssc.find("tokens", "delegations", {
      $or: [{ from: account }, { to: account }],
      symbol: symbol
    });

    if (result != null) {
      return result;
    } else {
      return 0;
    }
  },
  stakeToken: async (wif, account, symbol, amount) => {
    return new Promise((resolve, reject) => {
      let jsonStr = {
        contractName: "tokens",
        contractAction: "stake",
        contractPayload: { to: account, symbol: symbol, quantity: amount }
      };
      let json = JSON.stringify(jsonStr);

      steem.broadcast.customJson(
        wif,
        [account],
        [],
        "ssc-mainnet1",
        json,
        function(err, result) {
          if (err) {
            console.log(result);
            reject(err);
            return;
          }

          console.log("success stake!");
          resolve(result);
        }
      );
    });
  },
  delegateToken: async (wif, fromAccount, toAccount, symbol, amount) => {
    return new Promise((resolve, reject) => {
      let jsonStr = {
        contractName: "tokens",
        contractAction: "delegate",
        contractPayload: { to: toAccount, symbol: symbol, quantity: amount }
      };
      let json = JSON.stringify(jsonStr);

      steem.broadcast.customJson(
        wif,
        [fromAccount],
        [],
        "ssc-mainnet1",
        json,
        function(err, result) {
          if (err) {
            console.log(result);
            reject(err);
            return;
          }

          console.log("success delegate!");
          resolve(result);
        }
      );
    });
  },
  claimRewardBalance: async (wif, account, rs, rd, rv) => {
    return new Promise((resolve, reject) => {
      steem.broadcast.claimRewardBalance(wif, account, rs, rd, rv, function(
        err,
        result
      ) {
        if (err) {
          console.log("ERROR Claiming Rewards! :(");
          console.log(err);
          reject(err);
          return;
        }

        console.log("Woot! Rewards Claimed!");
        resolve(result);
      });
    });
  }, //END steem.broadcast.claimRewardBalance
  getVestingFund: async () => {
    const global = await steem.api.getDynamicGlobalPropertiesAsync();
    // total Vesting Fund Steem
    const totalVestingFundSteem = global.total_vesting_fund_steem.split(" ")[0];

    // total Vesting Shares
    const totalVestingShares = global.total_vesting_shares.split(" ")[0];

    return totalVestingFundSteem / totalVestingShares;
  },
  steemPowerUp: (wif, account, amount) => {
    return new Promise((resolve, reject) => {
      steem.broadcast.transferToVesting(wif, account, account, amount, function(
        err,
        result
      ) {
        if (err) {
          console.log(result);
          reject(err);
          return;
        }

        console.log("success power up!");
        resolve(result);
      });
    });
  },
  getHolder: symbol => {
    return new Promise(async (resolve, reject) => {
      await getScotHolder(symbol, 500, 0)
        .then(results => {
          // let i = 0;
          // for(const result of results){
          //   console.log(`${++i} : ${result.account}, ${result.symbol}, ${result.balance} ${result.symbol} `)
          // }
          resolve(results);
        })
        .catch(err => {
          reject(err);
        });
    });
  },
  issueToken: (wif, symbol, from_account, to_account, amount) => {
    return new Promise(async (resolve, reject) => {
      let jsonStr = {
        contractName: "tokens",
        contractAction: "issue",
        contractPayload: {
          to: to_account,
          symbol: symbol,
          quantity: amount + ""
        }
      };
      let json = JSON.stringify(jsonStr);

      steem.broadcast.customJson(
        wif,
        [from_account],
        [],
        "ssc-mainnet1",
        json,
        function(err, result) {
          if (err) {
            console.log(result);
            reject(err);
            return;
          }

          console.log(`success ${amount} ${symbol} issue to ${to_account}!`);
          resolve(result);
        }
      );
    });
  },
  getSteemVotingPower: account => {
    return new Promise(async (resolve, reject) => {
      await steemapi
        .getAccount(account)
        .then(result => {
          // 마지막 보팅 시각
          const last_vote_time = result.last_vote_time;

          // 마지막 보팅 파워
          const voting_power = result.voting_power;

          // 마지막 보팅 후 경과 시각(단위: 초)
          const elapsed_seconds =
            (new Date() - new Date(last_vote_time + "Z")) / 1000;

          // 재생된 보팅파워
          const regenerated_power =
            (10000 / (60 * 60 * 24 * 5)) * elapsed_seconds;

          // 현재 보팅파워
          const current_power = Math.ceil(
            Math.min(voting_power + regenerated_power, 10000)
          );
          resolve(current_power);
        })
        .catch(err => {
          reject(err);
        });
    });
  },
  scotVoting: async (wif, account, author, permlink, weight) => {
    return new Promise((resolve, reject) => {
      steem.broadcast.vote(wif, account, author, permlink, weight, function(
        err,
        result
      ) {
        if (err) {
          reject(err);
          return;
        } else if (result != null) {
          resolve(result);
        }
      });
    });
  }
};

// async function test(){
//   await steemapi.getSteemVotingPower('stablewon')
//   .then(result => {
//     console.log(result);
//   })

// }

// test();

module.exports = steemapi;
