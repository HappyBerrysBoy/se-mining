const SSC = require('sscjs');

const ssc = new SSC('https://api.steem-engine.com');
ssc.stream((err, res) => {
	console.log(err, res);
});


/**
* retrieve the specified transaction info of the sidechain
* @param  {String}  txid transaction id
* @param  {Function}  callback callback called if passed
* @returns  {Promise<JSON>} returns a promise if no callback passed
*/

// getTransactionInfo(txid, callback  =  null)

// example
ssc.getTransactionInfo('b299d24be543cd50369dbc83cf6ce10e2e8abc9b', (err, result) => {
	console.log(err, result);
	/*
	{
	    "blockNumber": 12,
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
	*/
})
