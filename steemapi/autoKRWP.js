const { transferToken } = require("../steemapi.js");
var dsteem = require("dsteem");
var client = new dsteem.Client("https://api.steemit.com");

const key = require("../key.json");
const account = "happyberrysboy";

const query = {
  tag: account,
  limit: 5,
};

getScotDataAsync(query);

async function getScotDataAsync(query) {
  var result = await client.database.getDiscussions("blog", query);
  const chkSctKrwp = result[0].active_votes.filter(
    (voter) => voter.voter == "sct.krwp"
  );

  if (chkSctKrwp.length) {
    console.log("ok");
  } else {
    console.log("Noooooooooo");

    const jsonStr = {
      contractName: "tokens",
      contractAction: "transfer",
      contractPayload: {
        symbol: "KRWP",
        to: "krwp.burn",
        quantity: "50",
        memo: "@" + result[0].url.split("@")[1],
      },
    };

    await transferToken(key.happyberrysboy_active, account, jsonStr)
      .then((r) => {
        console.log(r);
      })
      .catch((c) => {
        console.log(c);
      });
  }
}
