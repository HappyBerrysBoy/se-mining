const steem = require("steem");
const axios = require("axios");

steem.api.getAccounts(["happyberrysboy"], (err, data) => {
  if (err) {
    resolve(null);
    return;
  }

  console.log("-------------");
  console.log(data);

  JSON.stringify(data);

  if (!data.length) {
    resolve("NONE");
    return;
  }
});
