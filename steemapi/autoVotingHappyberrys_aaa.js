const steem = require("steem");
const axios = require("axios");
const SSC = require("sscjs");
const ssc = new SSC("https://api.steem-engine.com/rpc/");
const key = require("../key.json");
const cron = require("node-cron");
const fs = require("fs");

const discussionQueryforSteemEngine = {
  token: "AAA",
  limit: 30
};
let _votingList = new Array();
let _whitelist = new Map();

const voter = "happyberrys.aaa";
const query = "get_discussions_by_created";
const postingkey = key.happyberrys_aaa_posting;

fs.readFile(`./steemapi/whitelistForAAA.json`, "utf8", function(err, data) {
  if (err) {
    console.log(err);
    return;
  }

  data.split("\n").forEach(data => {
    if (!data.trim().length) return;

    const json = JSON.parse(data);

    if (!_whitelist.has(json.key)) {
      _whitelist.set(json.key, json.power);
    }
  });

  console.log(_whitelist);
});

cron.schedule("*/20 * * * * *", function() {
  console.log(`start getScotDataAsync(query, discussionQueryforSteemEngine)`);
  getPostingAsync(query, discussionQueryforSteemEngine).then(feedData => {
    let result = new Array();
    feedData.forEach(async content => {
      const diffTime =
        (new Date().getTime() - new Date(content.created).getTime()) /
          (1000 * 60) -
        9 * 60;
      if (diffTime < 200 && diffTime >= 15) {
        let isVoting = false;
        if (!_whitelist.has(content.author)) {
          return;
        }

        for (const voter_info of content.active_votes) {
          if (voter_info.voter === voter) {
            isVoting = true;
            break;
          }
        }

        if (isVoting) {
          //console.log("Already!");
        } else {
          //console.log("Not yet!");
          console.log(`input : ${content.author} - ${diffTime}`);
          const tmp = {
            wif: postingkey,
            account: voter,
            author: content.author,
            permlink: content.permlink,
            votingMana: _whitelist.get(content.author)
          };
          _votingList.push(tmp);
        }
      }
    });
  });
});

cron.schedule("*/10 * * * * *", function() {
  const tmp = _votingList.shift();

  if (tmp != null) {
    console.log(`start voting)`);
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
              "%.\n"
          );
        }
      }
    );
  }
});

async function getPostingAsync(path, params) {
  return callApi(`https://scot-api.steem-engine.com/${path}`, params);
}

async function callApi(url, params) {
  return await axios({
    url,
    method: "GET",
    params
  })
    .then(response => {
      return response.data;
    })
    .catch(err => {
      console.error(`Could not fetch data, url: ${url}`);
      return {};
    });
}
