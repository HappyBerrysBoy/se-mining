const steem = require("steem");
const axios = require("axios");
const SSC = require("sscjs");
const ssc = new SSC("https://api.steem-engine.com/rpc/");
const key = require("../keys.json");
const cron = require("node-cron");
const fs = require("fs");
// happyberrysboy_posting
// happyberrys_aaa_posting
// sct_cu13_posting
const discussionQuery = {
  token: "SCT",
  limit: 30,
};
let _votingList = new Array();
let _whitelist = new Map();

fs.readFile(`./whitelist.json`, "utf8", function(err, data) {
  if (err) {
    console.log(err);
    return;
  }

  data.split("\n").forEach(data => {
    if (!data.trim().length) return;

    const json = JSON.parse(data);

    // WEED는 100개로 너무 많음.. Winner가..
    if (!_whitelist.has(json.key)) {
      _whitelist.set(json.key, json.power);
    }
  });

  console.log(_whitelist);
});

//getScotDataAsync('get_discussions_by_promoted', discussionQuery)
cron.schedule("*/20 * * * * *", function() {
  getScotDataAsync("get_discussions_by_created", discussionQuery).then(
    feedData => {
      let result = new Array();
      feedData.forEach(async content => {
        const diffTime =
          (new Date().getTime() - new Date(content.created).getTime()) /
            (1000 * 60) -
          9 * 60;
        if (diffTime < 200 && diffTime >= 0) {
          let isVoting = false;
          if (!_whitelist.has(content.author)) {
            return;
          }

          for (const voter_info of content.active_votes) {
            if (voter_info.voter === "realmankwon") {
              isVoting = true;
              break;
            }
          }

          if (isVoting) {
            //console.log("Already!");
          } else {
            //console.log("Not yet!");
            console.log(`input : ${content.authorperm} - ${diffTime}`);
            const tmp = {
              wif: key.realmankwon_posting,
              account: "realmankwon",
              author: content.author,
              permlink: content.permlink,
              votingMana: _whitelist.get(content.author),
            };
            _votingList.push(tmp);
          }
        }
      });
    },
  );
});

cron.schedule("*/10 * * * * *", function() {
  const tmp = _votingList.shift();

  if (tmp != null) {
    steem.broadcast.vote(
      tmp.wif,
      tmp.account,
      tmp.author,
      tmp.permlink,
      tmp.votingMana * 100,
      function(err, result) {
        if (err);
        else if (result != null) {
          console.log(
            "\n Voted Succesfully, account: ",
            tmp.account,
            "permlink: " +
              tmp.permlink +
              ", author: " +
              tmp.author +
              ", weight: " +
              100 +
              "%.\n",
          );
        }
      },
    );
  }
});

async function getScotDataAsync(path, params) {
  return callApi(`https://scot-api.steem-engine.com/${path}`, params);
}

async function callApi(url, params) {
  return await axios({
    url,
    method: "GET",
    params,
  })
    .then(response => {
      return response.data;
    })
    .catch(err => {
      console.error(`Could not fetch data, url: ${url}`);
      return {};
    });
}
