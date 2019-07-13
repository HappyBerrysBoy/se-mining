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
  const blockno = { lastReadSteemBlock: 34300626 };
  blockno.lastReadSteemBlock = lastSteemBlock;
  console.log('start : ' + blockno.lastReadSteemBlock);

  setInterval(blockMonitoring, 2000, blockno);
}

async function blockMonitoring(blockno) {
  const date = new Date();
  // AWS 시간이 UTC 기준이라 국내보다 9시간 늦음 그래서 강제로 9시간 빠르게 돌림
  date.setHours(date.getHours() + 9);
  const year = date.getFullYear() + '';
  const month = (date.getMonth() + 1 + '').padStart(2, '0');
  const day = (date.getDate() + '').padStart(2, '0');
  const dateString = `${year}-${month}-${day}`;

  if (blockno.lastReadSteemBlock % 30 == 0) {
    console.log(`Block No:${blockno.lastReadSteemBlock}`);
  }

  let blockinfo = await steem.api.getBlockAsync(blockno.lastReadSteemBlock);

  if (blockinfo == null) {
    return;
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
  }

  retryCnt = 0;
  if (transactions.length == 0) return;

  transactions.forEach(transaction => {
    const { operations, signatures } = transaction;
    const action = operations[0][0];
    const content = operations[0][1];
    content.blocknumber = blockno.lastReadSteemBlock;

    if (action === 'custom_json') {
      try {
        const jsonInfo = JSON.parse(content.json);
        jsonInfo.timestamp = timestamp;
        jsonInfo.blocknumber = blockno.lastReadSteemBlock;

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
      } catch (e) {
        console.log(e);
        fs.appendFile(
          '../logs/exceptions(' + dateString + ').txt',
          'retry count over\n',
          err => {
            if (err) console.log(err);
          },
        );
        return;
      }
    } else if (
      action === 'comment' &&
      content.body.indexOf(config.pickTag) > -1
    ) {
      try {
        console.log(`${config.pickTag} : ${content.blocknumber}`);
        const hdata = content.body.split(config.pickTag)[1].match(/\((.*?)\)/g);
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
        let numOfTotalVal = 0;

        let participants = `\n<br>\n내용:${hdata}\n\n참가 리스트\n`;
        list.forEach((a, idx) => {
          accountList.push(a.split(':')[0].replace(/ /g, ''));
          if (a.indexOf(':') > -1) {
            const tmpVal = parseInt(a.split(':')[1].replace(/ /g, ''));
            valList.push(tmpVal);
            numOfTotalVal += tmpVal;
          } else {
            valList.push(1);
            numOfTotalVal += 1;
          }

          participants += `${accountList[idx]}:${
            valList.length == 1 ? 1 : numOfTotalVal - valList[idx] + 1
          }~${numOfTotalVal}\n`;
        });

        if (!numOfTotalVal) {
          throw `Something is wrong.(BlockNo:${content.blocknumber})==>${list}`;
        }

        if (list.length < pickCnt) {
          pickCnt = list.length;
        }

        let body = `##### Happy Pick Result!!(Pick ${pickCnt} Item${
          pickCnt < 2 ? '' : 's'
        })\n\n`;
        body += participants;
        body += `\nRanking..!!\n`;

        while (pickAccount.length < pickCnt) {
          const theNumber = Math.floor(Math.random() * numOfTotalVal) + 1;
          let culmulativeNum = 1;
          let selIdx = -1;

          valList.forEach((val, idx) => {
            if (
              culmulativeNum <= theNumber &&
              culmulativeNum + parseInt(val) > theNumber &&
              pickAccount.indexOf(accountList[idx]) < 0
            ) {
              selIdx = idx;
              pickAccount.push(accountList[selIdx]);
              pickedNum.push(theNumber);
            }

            culmulativeNum += parseInt(val);
          });
        }

        pickAccount.forEach((acc, idx) => {
          body += `No${idx + 1}. ${acc}(${pickedNum[idx]})\n`;
        });

        // content
        steem.broadcast.comment(
          key.happyberrysboy_posting,
          content.author,
          content.permlink,
          'happyberrysboy',
          steem.formatter
            .commentPermlink(content.author, content.permlink)
            .replace(/\./g, '')
            .substring(0, 16) + Math.floor(Math.random() * 10000),
          '',
          body,
          content.json_metadata,
          function(err, result) {
            console.log(err, result);
          },
        );

        const logJson = { content: content, result: body };

        fs.appendFile(
          '../logs/happypick(' + dateString + ').txt',
          JSON.stringify(logJson) + '\n',
          err => {
            if (err) console.log(err);
          },
        );
      } catch (e) {
        console.log(e);
        steem.broadcast.comment(
          key.happyberrysboy_posting,
          content.author,
          content.permlink,
          'happyberrysboy',
          steem.formatter.commentPermlink(content.author, content.permlink),
          '',
          e,
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
  });
}
