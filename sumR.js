const steem = require("steem");
const axios = require("axios");

const steemApiUrl = "https://api.steemit.com";
const steemEngineApiUrl = "https://steemapi.cryptoempirebot.com/rpc/contracts";

// const param = [{ tag: "mamacoco", limit: 51 }];

// const params = {
//   jsonrpc: "2.0",
//   method: "condenser_api.get_discussions_by_feed",
//   params: param,
//   id: 1
// };

// const param2 = { jsonrpc: "2.0", method: "jsonrpc.get_methods", id: 1 };

// const result = axios.post(steemApiUrl, params).then(r => {
//   console.log(r.data.result);
//   console.log(r.data.result[r.data.result.length - 1]);
// });

const sctrParam = {
  jsonrpc: "2.0",
  method: "find",
  params: {
    contract: "tokens",
    table: "balances",
    query: { symbol: "R" },
    limit: 1000,
    offset: 0,
    indexes: [],
  },
  id: 1,
};

const result2 = axios.post(steemEngineApiUrl, sctrParam).then((r) => {
  console.log(r.data.result);
  console.log(r.data.result[r.data.result.length - 1]);
});

console.log(result2);
