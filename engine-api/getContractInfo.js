const SSC = require('sscjs');

const ssc = new SSC('https://api.steem-engine.com/rpc/');
// ssc.stream((err, res) => {
//   console.log(err, res);
// });

/**
 * Get the information of a contract (owner, source code, etc...)
 * @param  {String}  name contract name
 * @param  {Function}  callback callback called if passed
 * @returns  {Promise<JSON>} returns a promise if no callback passed
 */

// getContractInfo(contract, callback  =  null)
// example
ssc.getContractInfo('tokens', (err, result) => {
  console.log(err, result);
  /*
	{
	    "name": "tokens",
	    "owner": "steemsc",
	    "code": "...source code of the contract...",
	    "tables": [
	        "tokens_tokens",
		...
	    ],
	    "$loki": 1
	}
	*/
});
