const steem = require('steem');
const config = require('../config.json');
// const { createLogger, format, transports } = require("winston");
//const log = require('log-to-file');
const fs = require('fs');

const jsonData = {
  lastReadSteemBlock: 34543118,
  lastReadSscBlock: 400005,
};

fs.readFile('../config/blockConfig.ini', 'utf8', function(err, data) {
  if (err) console.log(err);
  const json = JSON.parse(data);
  console.log(json.lastReadSteemBlock);
  jsonData.lastReadSteemBlock = json.lastReadSteemBlock;
  getBlock(jsonData.lastReadSteemBlock);
});

function sleep(delay) {
  let start = new Date().getTime();
  while (new Date().getTime() < start + delay);
}

async function getBlock(lastSteemBlock) {
  console.log('parameter : ' + lastSteemBlock);
  let blockinfo;
  const blockno = { lastReadSteemBlock: 34300626 };
  blockno.lastReadSteemBlock = lastSteemBlock;
  console.log('start : ' + blockno.lastReadSteemBlock);

  let retryCnt = 0;

  while (true) {
    const date = new Date();
    const year = date.getFullYear() + '';
    const month = (date.getMonth() + 1 + '').padStart(2, '0');
    const day = (date.getDate() + '').padStart(2, '0');
    // const hour = (date.getHours() + '').padStart(2, '0');
    // const minute = (date.getMinutes() + '').padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

    console.log(`Start Block Search:${blockno.lastReadSteemBlock}`);
    blockinfo = await steem.api.getBlockAsync(blockno.lastReadSteemBlock);

    if (blockinfo == null) {
      sleep(3000);
      continue;
    }

    let timestamp;
    let transactions;

    try {
      timestamp = blockinfo.timestamp;
      transactions = blockinfo.transactions;
    } catch (e) {
      console.log(e);
      console.log(`const { timestamp = null, transactions } = blockinfo error`);
      fs.appendFile(
        '../logs/exceptions(' + dateString + ').txt',
        JSON.stringify(blockinfo) + '\n',
        err => {
          if (err) console.log(err);
        },
      );

      // 해당 블럭 읽기 재시도
      retryCnt++;
      if (retryCnt > 3) {
        fs.appendFile(
          '../logs/exceptions(' + dateString + ').txt',
          'retry count over\n',
          err => {
            if (err) console.log(err);
          },
        );
        break;
      } else {
        continue;
      }
    }

    retryCnt = 0;
    if (transactions.length == 0) return;

    transactions.forEach(transaction => {
      const { operations, signatures } = transaction;
      const action = operations[0][0];
      const content = operations[0][1];
      content.blocknumber = blockno.lastReadSteemBlock;

      if (action === 'custom_json') {
        const jsonInfo = JSON.parse(content.json);
        jsonInfo.timestamp = timestamp;
        jsonInfo.blocknumber = blockno.lastReadSteemBlock;

        fs.appendFile(
          '../logs/customjson(' + dateString + ').txt',
          JSON.stringify(content) + '\n',
          err => {
            if (err) console.log(err);
          },
        );

        if (
          content.id === config.customJsonList.mining &&
          jsonInfo.type === config.customJsonList.mining_type
        ) {
          const winner = jsonInfo.winner;
          const amount = jsonInfo.claim_token_amount;
          const miningPower = jsonInfo.staked_mining_power;
          const symbol = jsonInfo.symbol;
          const blockNum = jsonInfo.block_num;

          console.log('content :', jsonInfo);

          fs.appendFile(
            '../logs/mining(' + dateString + ').txt',
            JSON.stringify(jsonInfo) + '\n',
            err => {
              if (err) console.log(err);
            },
          );
          // {"service":"SE_MINING","content":"key:id, content:scot_claim","level":"info","message":"info","timestamp":"2019-06-25 01:42:46"}
          // {"service":"SE_MINING","content":"key:json, content:{\"symbol\":\"PAL\",\"type\":\"mining\",\"N\":9,\"staked_mining_power\":2313.0000000000005,\"winner\":[\"bitcoinflood\",\"jongolson\",\"michealb\",\"nuthman\",\"aggroed\",\"dylanhobalart\",\"dylanhobalart\",\"videosteemit\",\"steinreich\"],\"claim_token_amount\":2.067,\"trx_id\":\"4654e524c287b4354981587aea3a62f133da8648\",\"block_num\":34084567,\"N_accounts\":166}","level":"info","message":"info","timestamp":"2019-06-25 01:42:46"}
        } else {
        }
      } else if (
        action === 'comment' &&
        content.body.indexOf('#happypick') > -1
      ) {
        try {
          console.log(`#happypickpick : ${content.body}`);
          const hdata = content.body.split('#happypick')[1].match(/\((.*?)\)/g);
          const list = hdata[0]
            .replace(/\(/g, '')
            .replace(/\)/g, '')
            .split(',');
          let accountList = [];
          let valList = [];
          let numOfPerson = list.length;
          let numOfTotalVal = 0;
          list.forEach(a => {
            accountList.push(a.split(':')[0].replace(/ /g, ''));
            valList.push(parseFloat(a.split(':')[1].replace(/ /g, '')));
            numOfTotalVal += parseFloat(a.split(':')[1].replace(/ /g, ''));
          });

          console.log(accountList, valList, numOfTotalVal);

          const theNumber = Math.floor(Math.random() * numOfTotalVal) + 1;
          let culmulativeNum = 1;
          let selIdx = -1;
          valList.forEach((val, idx) => {
            if (
              culmulativeNum <= theNumber &&
              culmulativeNum + val > theNumber
            ) {
              selIdx = idx;
              console.log(
                `The Number is ${theNumber}, Picked Idx:${selIdx}, Picked Person:${
                  accountList[selIdx]
                }`,
              );
            }

            culmulativeNum += val;
          });

          console.log(
            `Picked Idx:${selIdx}, Picked Person:${accountList[selIdx]}`,
          );
        } catch (e) {
          console.log(e);
        }
      }
    });

    blockno.lastReadSteemBlock += 1;

    fs.writeFile('../config/blockConfig.ini', JSON.stringify(blockno), err => {
      if (err) console.log(err);
      //console.log('The file has been saved!');
    });

    sleep(300);
  }
}
