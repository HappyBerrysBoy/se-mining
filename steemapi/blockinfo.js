const steem = require('steem');
const config = require('../config.json');
// const { createLogger, format, transports } = require("winston");
//const log = require('log-to-file');
const fs = require('fs');

const jsonData = {
  lastReadSteemBlock: 34300626,
  lastReadSscBlock: 400005,
};



// fs.readFile(`${config.blockConfigPath}`, 'utf8', function(err, data) {
//   if (err) console.log(err);
//   const json = JSON.parse(data);
//   console.log(json.lastReadSteemBlock);
//   jsonData.lastReadSteemBlock = json.lastReadSteemBlock;
  
// });

getBlock(jsonData.lastReadSteemBlock);


async function getBlock(lastSteemBlock) {
  console.log( lastSteemBlock)
    let blockinfo;
    while (true) {
      console.log(jsonData.lastReadSteemBlock);
       blockinfo = await steem.api.getBlockAsync(jsonData.lastReadSteemBlock);
        
        const { timestamp, transactions } = blockinfo;
      
        if (transactions.length == 0) return;
      
        transactions.forEach(transaction => {
          const { operations, signatures } = transaction;
          const action = operations[0][0];
          const content = operations[0][1];
          // console.log('action :', action);
          // console.log('content :', content);
      
           if (action === "custom_json") {
            // console.log('action :', action);
            // console.log('content :', content);
      
            const jsonInfo = JSON.parse(content.json);
            //console.log(jsonInfo);
            if (jsonInfo.contractName === "tokens" && jsonInfo.contractAction === "issue") {
              const payload = jsonInfo.contractPayload;
              if(payload.symbol === "SCT" && payload.to === "sct.admin"){
                payload.timestamp = timestamp;
                
                fs.appendFile('./logs/sct_beneficery.txt', JSON.stringify(content), err => {
                  if (err) console.log(err);
                });
              }
            } 
          }
        });

        jsonData.lastReadSteemBlock += 1;
  
        fs.writeFile(`${config.blockConfigPath}`, JSON.stringify(jsonData), err => {
          if (err) console.log(err);
          //console.log('The file has been saved!');
        });
    }
}

