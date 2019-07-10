const steem = require('steem');
const config = require('../config.json');
// const { createLogger, format, transports } = require("winston");
//const log = require('log-to-file');
const fs = require('fs');

const jsonData = {
  lastReadSteemBlock: 34334175,
  lastReadSscBlock: 400005,
};

fs.readFile('../logs/block.txt', 'utf8', function(err, data) {
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
  while (true) {
    //      console.log(jsonData.lastReadSteemBlock);
    blockinfo = await steem.api.getBlockAsync(blockno.lastReadSteemBlock);

    const { timestamp, transactions } = blockinfo;

    if (transactions.length == 0) return;

    transactions.forEach(transaction => {
      const { operations, signatures } = transaction;
      const action = operations[0][0];
      const content = operations[0][1];

      if (action === 'custom_json') {
        const jsonInfo = JSON.parse(content.json);
        //console.log(jsonInfo);
        if (
          jsonInfo.contractName === 'tokens' &&
          jsonInfo.contractAction === 'issue'
        ) {
          const payload = jsonInfo.contractPayload;
          if (payload.symbol === 'SCT' && payload.to === 'sct.admin') {
            payload.timestamp = timestamp;
            payload.block = blockno.lastReadSteemBlock;
            console.log(payload);

            fs.appendFile(
              '../logs/sct_beneficery.txt',
              JSON.stringify(payload) + '\n',
              err => {
                if (err) console.log(err);
              },
            );
          }
        }
      }
    });

    blockno.lastReadSteemBlock += 1;

    fs.writeFile('../logs/block.txt', JSON.stringify(blockno), err => {
      if (err) console.log(err);
      //console.log('The file has been saved!');
    });
  }
}
