const SSC = require("sscjs");
const { createLogger, format, transports } = require("winston");
const config = require("../config.json");

const ssc = new SSC("https://steemapi.cryptoempirebot.com/rpc/");
const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: "SE_MINING" },
  transports: [
    //
    // - Write to all logs with level `info` and below to `combined.log`
    // - Write all logs error (and below) to `error.log`.
    //
    new transports.File({ filename: "error.log", level: "error" }),
    new transports.File({ filename: "systemout.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    })
  );
}

/**
 * stream part of the sidechain
 * @param  {Number}  startBlock the first block to retrieve
 * @param  {Number}  endBlock if passed the stream will stop after the block is retrieved
 * @param  {Function}  callback callback called everytime a block is retrieved
 * @param  {Number}  pollingTime polling time, default 1 sec
 */

// streamFromTo(startBlock, endBlock  =  null, callback, pollingTime  =  1000)

let existTransactions = config.existTransactions;

const lastBlockIdx = 384272;

// example
// 412766 : delegation
ssc.streamFromTo(lastBlockIdx + 1, lastBlockIdx + 300, (err, result) => {
  if (err) {
    console.log(err);
    logger.info("error", err);
  }

  // console.log(result);
  // logger.info('info', result);

  const { blockNumber, refSteemBlockNumber, timestamp, transactions } = result;

  if (transactions.length == 0) return;

  console.log(`===== Block Number:${blockNumber} =====`);
  transactions.forEach((transaction) => {
    const { sender, contract, action, payload } = transaction;

    console.log(
      `Transaction Info==> Action:${action}, Sender:${sender}, Contract:${contract}, Payload:${payload}`
    );

    // if (config.traceTokens.indexOf(payload.symbol) < 0) return;

    if (existTransactions.indexOf(action) > -1) return;
    existTransactions.push(action);

    // if (action === 'transfer') {
    // } else if (action === 'create') {
    // } else if (action === 'delegate') {
    // } else if (action === 'issue') {
    // } else if (action === 'buy') {
    // } else {
    logger.info("info", {
      msg: `Transaction Info==> Action:${action}, Sender:${sender}, Contract:${contract}, Payload:${payload}`,
    });
    // }
  });
  /*
	{
	    "blockNumber": 12,
	    "refSteemBlockNumber": 25797141,
	    "previousHash": "9389c132270c7335b806a43bd063110fe3868015f96db80470bef2f48f1c2fcb",
	    "timestamp": "2018-09-09T02: 48: 48",
	    "transactions": [
	        {
	            "refSteemBlockNumber": 25797141,
	            "transactionId": "b299d24be543cd50369dbc83cf6ce10e2e8abc9b",
	            "sender": "smmarkettoken",
	            "contract": "smmkt",
	            "action": "updateBeneficiaries",
	            "payload": {
	                "beneficiaries": [
	                    "harpagon"
	                ],
	                "isSignedWithActiveKey": true
	            },
	            "hash": "ac33d2fcaf2d72477483ab1f2ed4bf3bb077cdb55d5371aa896e8f3fd034e6fd",
	            "logs": "{}"
	        }
	    ],
	    "hash": "e97e4b9a88b4ac5b8ed5f7806738052d565662eec962a0c0bbd171672a4a54d4",
	    "merkleRoot": "2f1221ae1938bc24f3ed593e8c57ea41882fedc5d31de21da9c9bd613360f3a6"
	}
	*/
});
