const SSC = require('sscjs');

const ssc = new SSC('https://api.steem-engine.com/rpc/');
// ssc.stream((err, res) => {
//   console.log(err, res);
// });

/**
 * retrieve a record from the table of a contract
 * @param  {String}  contract contract name
 * @param  {String}  table table name
 * @param  {JSON}  query query to perform on the table
 * @param  {Function}  callback callback called if passed
 * @returns  {Promise<JSON>} returns a promise if no callback passed
 */

// findOne(contract, table, query, callback  =  null)

// example
// See https://github.com/techfort/LokiJS/wiki/Query-Examples for the available params
ssc.findOne(
  'tokens',
  'balances',
  {
    account: 'harpagon',
  },
  (err, result) => {
    console.log(err, result);
    /*
	{
            "account": "harpagon",
            "symbol": "SSC",
            "balance": 3.0005,
            "$loki": 6
        }
	*/
  },
);
