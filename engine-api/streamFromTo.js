const SSC = require('sscjs');

// const ssc = new SSC('https://api.steem-engine.com');
const ssc = new SSC("https://api.steem-engine.com/rpc/");
ssc.stream((err, res) => {
	console.log(err, res);
});


/**
* stream part of the sidechain
* @param  {Number}  startBlock the first block to retrieve
* @param  {Number}  endBlock if passed the stream will stop after the block is retrieved
* @param  {Function}  callback callback called everytime a block is retrieved
* @param  {Number}  pollingTime polling time, default 1 sec
*/

// streamFromTo(startBlock, endBlock  =  null, callback, pollingTime  =  1000)

// example
ssc.streamFromTo(406256, 406257, (err, result) => {
	console.log(err, result);
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
})