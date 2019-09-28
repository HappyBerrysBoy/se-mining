const steem = require("steem");
const fs = require("fs");
const key = require("../key.json");

const miningTargetCoin = ["SCT", "ZZAN", "PAL", "ENG", "IV", "LEO", "SAGO"];

const date = new Date();
date.setDate(date.getDate() - 1); // 하루전..
date.setHours(date.getHours() + 9); // 9시간 추가
const year = date.getFullYear() + "";
const month = (date.getMonth() + 1 + "").padStart(2, "0");
const day = (date.getDate() + "").padStart(2, "0");
const dateString = `${year}-${month}-${day}`;

const author = "happy.report";

const title = `Steem-engine(${dateString}) Mining Report`;
let body = `![](https://cdn.steemitimages.com/DQmQD8RiPr7xWSFf3vk1217AYcrc8ppeAt3U7LSto7q6KCe/image.png)\n`;
body += `This report shows all mining results from steem-engine. This report is issued once a day.\n`;
body += `# Last Day Steem Engine Mining Report \n<br>\n`;

fs.readFile(
  `/home/ubuntu/workspace/se-mining/logs/mining(${dateString}).txt`,
  "utf8",
  function(err, data) {
    if (err) {
      console.log(err);
      return;
    }

    console.log(`reading mining(${dateString}).txt`);
    const map = new Map();

    data.split("\n").forEach(data => {
      if (!data.trim().length) return;

      const json = JSON.parse(data);

      if (!miningTargetCoin.includes(json.symbol)) return;
      // WEED는 100개로 너무 많음.. Winner가..
      // if (json.symbol === "WEED") return;
      // if (json.symbol === "NEOXAG") return;
      // if (json.symbol === "GG") return;
      // if (json.symbol === "STEM") return;
      // if (json.symbol === "CCC") return;

      if (!map.has(json.symbol)) {
        map.set(json.symbol, [json]);
      } else {
        map.get(json.symbol).push(json);
      }
    });

    for (var [keyinfo, value] of map.entries()) {
      let totalAmount = 0;
      let tmp = "";
      tmp += `|Type|Content|\n|----|--------------------|\n`;
      value.forEach(mining => {
        tmp += `|Time|${new Date(mining.timestamp).koreaDate()}|\n`;
        tmp += `|Staked|${mining.staked_mining_power.toFixed(3)}|\n`;
        tmp += `|Amount|${mining.claim_token_amount}|\n`;
        mining.winner.sort().forEach((winner, idx) => {
          tmp += `|Winners${idx + 1}|${winner}| \n`;
        });
        tmp += `|----|-------------------------|\n`;

        totalAmount += mining.claim_token_amount * mining.winner.length;
      });

      tmp += "<br><br>\n";

      body += `### ${keyinfo} - Total Amount(${totalAmount.toFixed(
        3
      )}), Count(${value.length}) \n`;
      body += tmp;
    }

    var operations = [
      [
        "comment",
        {
          parent_author: "",
          parent_permlink: "sct",
          author: author,
          permlink: `${author.replace(/./g, "")}-mining-report-${dateString}`,
          title: title,
          body: body,
          json_metadata: JSON.stringify({
            tags: [
              "sct",
              "zzan",
              "busy",
              "liv",
              "jjm",
              "steemleo",
              "palnet",
              "sct-en",
              "sct-mining"
            ],
            community: "busy",
            app: "steemcoinpan/0.1",
            format: "markdown"
          })
        }
      ],
      [
        "comment_options",
        {
          author: author,
          permlink: `${author.replace(/./g, "")}-mining-report-${dateString}`,
          max_accepted_payout: "100000.000 SBD",
          percent_steem_dollars: 5000,
          allow_votes: true,
          allow_curation_rewards: true,
          extensions: [
            [
              0,
              {
                beneficiaries: [{ account: "happyberrysboy", weight: 10000 }]
              }
            ]
          ]
        }
      ]
    ];
    steem.broadcast.send(
      { operations: operations, extensions: [] },
      { posting: key.happy_report_posting },
      function(e, r) {
        if (e) {
          console.log(e);
          return;
        }

        console.log(r);
      }
    );
  }
);

Date.prototype.addHours = function(h) {
  this.setHours(this.getHours() + h);
  return this;
};

Date.prototype.koreaDate = function() {
  this.setHours(this.getHours() + 9);
  return `${this.getFullYear()}-${this.getMonth() + 1}-${(
    this.getDate() + ""
  ).padStart(2, "0")} ${(this.getHours() + "").padStart(2, "0")}:${(
    this.getMinutes() + ""
  ).padStart(2, "0")}`;
};
