const SSC = require("sscjs");

const ssc = new SSC("https://steemapi.cryptoempirebot.com/rpc/");
// ssc.stream((err, res) => {
// 	console.log(err, res);
// });

/**
 * retrieve records from the table of a contract
 * @param {String} contract contract name
 * @param {String} table table name
 * @param {JSON} query query to perform on the table
 * @param {Integer} limit limit the number of records to retrieve
 * @param {Integer} offset offset applied to the records set
 * @param {Array<Object>} indexes array of index definitions { index: string, descending: boolean }
 * @param {Function} callback callback called if passed
 * @returns {Promise<JSON>} returns a promise if no callback passed
 */

// find(contract, table, query, limit = 1000, offset = 0, indexes = [], callback = null)

// example
// See https://github.com/techfort/LokiJS/wiki/Query-Examples for the available params

ssc.find("tokens", "tokens", {}, 1000, 0, [], (err, result) => {
  console.log(err, result);
  /*
	[
	    	{
		    "issuer": "steemsc",
		    "symbol": "STEEMP",
		    "name": "STEEM Pegged",
		    "precision": 3,
		    "maxSupply": 1000000000000,
		    "supply": 1000000000000,
		    "$loki": 1
		},
		{
		    "issuer": "null",
		    "symbol": "SSC",
		    "name": "Steem Smart Contracts Token",
		    "url": "https://steemsmartcontracts.com",
		    "precision": 8,
		    "maxSupply": 1000000000000,
		    "supply": 250000000,
		    "$loki": 2
		},
	]
	*/
});
