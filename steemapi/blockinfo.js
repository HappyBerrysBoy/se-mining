const steem = require('steem');
const config = require('../config.json');
// const { createLogger, format, transports } = require("winston");
//const log = require('log-to-file');
const fs = require('fs');
const key = require('../key.json');

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

        // 용량 많이 잡아먹어서 하루치만
        // fs.appendFile(
        //   '../logs/customjson(' + dateString + ').txt',
        //   JSON.stringify(content) + '\n',
        //   err => {
        //     if (err) console.log(err);
        //   },
        // );

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
        content.body.indexOf(config.pickTag) > -1
      ) {
        try {
          console.log(`${config.pickTag} : ${content.body}`);
          const hdata = content.body
            .split(config.pickTag)[1]
            .match(/\((.*?)\)/g);
          let pickCnt = parseInt(
            content.body
              .split(config.pickTag)[1]
              .split('(')[0]
              .trim(),
          );

          // 몇명 뽑는지 입력 안하면 1명으로 설정
          if (isNaN(pickCnt)) {
            pickCnt = 1;
          }

          const list = hdata[0]
            .replace(/\(/g, '')
            .replace(/\)/g, '')
            .split(',');

          let pickAccount = [];
          let pickedNum = [];
          let accountList = [];
          let valList = [];
          let numOfPerson = list.length;
          let numOfTotalVal = 0;

          list.forEach(a => {
            accountList.push(a.split(':')[0].replace(/ /g, ''));
            if (a.indexOf(':') > -1) {
              valList.push(parseFloat(a.split(':')[1].replace(/ /g, '')));
              numOfTotalVal += parseFloat(a.split(':')[1].replace(/ /g, ''));
            } else {
              valList.push(1);
              numOfTotalVal += 1;
            }
          });

          if (list.length < pickCnt) {
            pickCnt = list.length;
          }

          // console.log(accountList, valList, numOfTotalVal);

          let body = `##### Happy Pick Result!!(Pick ${pickCnt} account${
            pickCnt < 2 ? '' : 's'
          })\n\nPlay${hdata}\n\nRanking..!!\n`;

          while (pickAccount.length < pickCnt) {
            const theNumber = Math.floor(Math.random() * numOfTotalVal) + 1;
            let culmulativeNum = 1;
            let selIdx = -1;

            valList.forEach((val, idx) => {
              if (
                culmulativeNum <= theNumber &&
                culmulativeNum + val > theNumber &&
                pickAccount.indexOf(accountList[idx]) < 0
              ) {
                selIdx = idx;
                // console.log(
                //   `The Number is ${theNumber}, Picked Idx:${selIdx}, Picked Person:${
                //     accountList[selIdx]
                //   }`
                // );

                pickAccount.push(accountList[selIdx]);
                pickedNum.push(theNumber);
              }

              culmulativeNum += val;
            });
          }

          pickAccount.forEach((acc, idx) => {
            // console.log(`No ${idx + 1}. ${acc}`);
            body += `No${idx + 1}. ${acc}(${pickedNum[idx]})\n`;
          });

          // content
          steem.broadcast.comment(
            key.happyberrysboy_posting,
            content.author,
            content.permlink,
            'happyberrysboy',
            steem.formatter.commentPermlink(content.author, content.permlink),
            '',
            body,
            content.json_metadata,
            function(err, result) {
              console.log(err, result);
            },
          );

          fs.appendFile(
            '../logs/happypick(' + dateString + ').txt',
            body + '\n',
            err => {
              if (err) console.log(err);
            },
          );

          console.log(body);
        } catch (e) {
          console.log(e);
          steem.broadcast.comment(
            key.happyberrysboy_posting,
            content.author,
            content.permlink,
            'happyberrysboy',
            steem.formatter.commentPermlink(content.author, content.permlink),
            '',
            '입력하는데 뭔가 실수 하셨는데예?',
            content.json_metadata,
            function(err, result) {
              console.log(err, result);
            },
          );
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

function sleep(delay) {
  let start = new Date().getTime();
  while (new Date().getTime() < start + delay);
}

function shuffle(arr) {
  let currentIndex = arr.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = arr[currentIndex];
    arr[currentIndex] = arr[randomIndex];
    arr[randomIndex] = temporaryValue;
  }
}
