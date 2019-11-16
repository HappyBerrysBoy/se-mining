const {
  transferToken,
  getTokenBalances,
  checkPendingClaim,
  claimRewards,
  getAccount,
  claimRewardBalance,
  getVestingFund,
  stakeToken,
  delegateToken,
  steemPowerUp
} = require("../steemapi.js");

const key = require("../key.json");

const accountList = [
  {
    account: "happyberrysboy",
    symbol: "SCT",
    key: key.happyberrysboy_active,
    remainToken: 600
  },
  {
    account: "happyberrys.aaa",
    symbol: "AAA",
    key: key.happyberrys_aaa_active,
    remainToken: 0
  },
  {
    account: "happy.report",
    symbol: "SCT",
    key: key.happy_report_active,
    remainToken: 0
  }
];

doClaimStaking();
setInterval(doClaimStaking, 10 * 60 * 1000);

async function doClaimStaking() {
  console.log("[start claim and staking]");
  await claimToken(accountList).then(async r => {
    console.log(r);
  });
  await stakingToken(accountList).then(async r => {
    console.log(r);
  });
}

function claimToken(list) {
  return new Promise(async (resolve, reject) => {
    try {
      for (let i = 0; i < list.length; i++) {
        const data = list[i];
        await claimRewards(data.key, data.account, data.symbol);
        console.log(`[claim completed]:${data.account}, ${data.symbol}`);
      }
      resolve("claim complete");
    } catch (e) {
      reject(new Error(e));
    }
  });
}

async function stakingToken(list) {
  return new Promise(async (resolve, reject) => {
    try {
      for (let i = 0; i < list.length; i++) {
        const data = list[i];
        let bal = await getTokenBalances(data.account, data.symbol);

        if (parseFloat(bal.balance) > data.remainToken) {
          bal.balance = parseFloat(bal.balance) - data.remainToken;
        } else {
          continue;
        }

        if (bal.balance > 0) {
          const result = await stakeToken(
            data.key,
            data.account,
            data.symbol,
            bal.balance.toFixed(3)
          );
          console.log(
            `[staking completed]:${data.account}, ${data.symbol}, ${bal.balance}`
          );
        }
      }
      resolve("staking complete");
    } catch (e) {
      reject(e);
    }
  });
}
