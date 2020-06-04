const steem = require("steem");

let startno = 42321196;
let endno = 43911521;
const producer = "steem-agora";
const sum = {};
const count = {};

async function play() {
  for (let i = startno; i < endno; i++) {
    if (i % 100 == 0) console.log(`Block No:${i}`);
    await getBlock(i);
  }

  console.log(JSON.stringify(sum));
  console.log(JSON.stringify(count));
}

function getBlock(blockno) {
  return new Promise((resolve, reject) => {
    steem.api.getOpsInBlock(blockno, true, (err, data) => {
      try {
        data = data.filter((x) => x.op[0] == "producer_reward");
      } catch (e) {
        console.log(e);
        resolve();
        return;
      }

      if (data.length == 0) {
        resolve();
        return;
      }
      if (data[0].op[1].producer != producer) {
        resolve();
        return;
      }

      const date = new Date(data[0].timestamp);
      const key = date.getFullYear() + "" + (date.getMonth() + 1);
      const shares = getVestingValue(data[0].op[1].vesting_shares);

      if (Object.keys(sum).indexOf(key) > -1) {
        sum[key] += shares;
      } else {
        sum[key] = shares;
      }

      count[key]++;

      console.log(`Key:${key}, Add Shares:${shares} Total:${sum[key]}`);
      resolve();
    });
  });
}

function getVestingValue(str) {
  return parseFloat(str.split(" ")[0]);
}

play();
