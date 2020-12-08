const steem = require("steem");
const steemapi = require("../steemapi.js");
const key = require("../key.json");

const date = new Date();
date.setHours(date.getHours() + 9); // 9시간 추가
date.setDate(date.getDate() + 1);
const year = date.getFullYear() + "";
const month = (date.getMonth() + 1 + "").padStart(2, "0");
const day = (date.getDate() + "").padStart(2, "0");
const permlink = `${year}-${month}-${day}-kr`;
const account = "maikuraki";

module.exports = async () => {
  const json = {
    contractName: "tokens",
    contractAction: "transfer",
    contractPayload: {
      symbol: "SCT",
      to: "sct.postingfee",
      quantity: "1",
      memo: `@${account}/${permlink}`,
    },
  };

  steemapi
    .getContent(account, permlink)
    .then((data) => {
      // 여기 들어온 것만해도 포스팅은 존재한다는 말
      console.log(data);
      steemapi.transferToken(key.mai_active, account, json).then((result) => {
        console.log(result);
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
