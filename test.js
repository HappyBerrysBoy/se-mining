const steem = require("steem");

steem.api.getCurrentMedianHistoryPrice(function(err, result) {
  console.log(err, result);
});
