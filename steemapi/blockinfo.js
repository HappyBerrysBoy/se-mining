const steem = require("steem");
const config = require("../config.json");
// const { createLogger, format, transports } = require("winston");
const log = require("log-to-file");
const fs = require("fs");

const jsonData = {
  lastReadSteemBlock: 33333337,
  lastReadSscBlock: 400005
};

fs.writeFile(`../${config.blockConfigPath}`, JSON.stringify(jsonData), err => {
  if (err) console.log(err);
  console.log("The file has been saved!");
});

fs.readFile(`../${config.blockConfigPath}`, "utf8", function(err, data) {
  if (err) console.log(err);
  console.log(data);
  const json = JSON.parse(data);
  console.log(json);
  console.log(json.lastReadSteemBlock);
});

const date = new Date();
const year = date.getFullYear() + "";
const month = (date.getMonth() + 1 + "").padStart(2, "0");
const day = (date.getDate() + "").padStart(2, "0");
const hour = (date.getHours() + "").padStart(2, "0");
const minute = (date.getMinutes() + "").padStart(2, "0");

// steem.api.getBlock(34077381, function(err, blockinfo) {
//   if (err) {
//     console.log('Error', err);
//   }

//   const { timestamp, transactions } = blockinfo;

//   if (transactions.length == 0) return;

//   transactions.forEach(transaction => {
//     const { operations, signatures } = transaction;
//     const action = operations[0][0];
//     const content = operations[0][1];
//     // console.log('action :', action);
//     // console.log('content :', content);

//     if (action === 'voter') {
//     } else if (action === 'transfer') {
//     } else if (action === 'custom_json') {
//       // console.log('action :', action);
//       // console.log('content :', content);
//       logger.info('info', {
//         msg: `Transaction Info==> Action:${action}, content:${content}`,
//       });
//     }
//   });
// });

//====================================================================================
steem.api.streamBlock(function(err, blockinfo) {
  if (err) {
    console.log("Error", err);
  }

  const { timestamp, transactions } = blockinfo;

  if (transactions.length == 0) return;

  transactions.forEach(transaction => {
    const { operations, signatures } = transaction;
    const action = operations[0][0];
    const content = operations[0][1];
    // console.log('action :', action);
    // console.log('content :', content);

    if (action === "custom_json") {
      // logger.info("info", { title: "=====custom_json======" });
      Object.keys(content).forEach(key => {
        // logger.info("info", { content: `key:${key}, content:${content[key]}` });
        console.log(content[key]);
      });
    }

    if (action === "voter") {
    } else if (action === "transfer") {
    } else if (action === "custom_json") {
      // console.log('action :', action);
      // console.log('content :', content);

      const jsonInfo = JSON.parse(content.json);

      if (content.id === config.customJsonList.mining) {
        const winner = jsonInfo.winner;
        const amount = jsonInfo.claim_token_amount;
        const miningPower = jsonInfo.staked_mining_power;
        const symbol = jsonInfo.symbol;
        const blockNum = jsonInfo.block_num;
        console.log("action :", action);
        console.log("content :", content);
        // content :
        // Object {required_auths: Array(1), required_posting_auths: Array(0), id: "scot_claim", json: "{"symbol":"SCT","type":"mining","N":10,"staked_min…"}
      } else {
      }
      // logger.info('info', {
      //   msg: `Transaction Info==> Action:${action}, content:${content}`,
      // });
      // scot_claim
    }
  });
});
//====================================================================================

// steem.api.streamTransactions(function(err, response) {
//   if (err) {
//     console.log('Error', err);
//   }
//   console.log(response.operations[0][1]);
// });

// steem.api.streamOperations(function(err, response) {
//   if (err) {
//     console.log('Error', err);
//   }
//   console.log(response);
// });
