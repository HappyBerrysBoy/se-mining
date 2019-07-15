const steem = require('steem');
const fs = require('fs');
const key = require('../key.json');

const date = new Date();
date.setDate(date.getDate() - 1); // 하루전..
date.setHours(date.getHours() + 9); // 9시간 추가
const year = date.getFullYear() + '';
const month = (date.getMonth() + 1 + '').padStart(2, '0');
const day = (date.getDate() + '').padStart(2, '0');
const dateString = `${year}-${month}-${day}`;

const title = `Steem-engine(${dateString}) Mining Report`;
let body = `![](https://cdn.steemitimages.com/DQmQD8RiPr7xWSFf3vk1217AYcrc8ppeAt3U7LSto7q6KCe/image.png)\n`;
body += `This report shows all mining results from steem-engine. This report is issued once a day.\n`;
body += `# Last Day Steem Engine Mining Report \n<br>\n`;

fs.readFile(`../logs/mining(${dateString}).txt`, 'utf8', function(err, data) {
  if (err) {
    console.log(err);
    return;
  }
  const map = new Map();

  data.split('\n').forEach(data => {
    if (!data.trim().length) return;

    const json = JSON.parse(data);

    // WEED는 100개로 너무 많음.. Winner가..
    if (json.symbol === 'WEED') return;
    if (json.symbol === 'NEOXAG') return;

    if (!map.has(json.symbol)) {
      map.set(json.symbol, [json]);
    } else {
      map.get(json.symbol).push(json);
    }
  });

  for (var [keyinfo, value] of map.entries()) {
    let totalAmount = 0;
    let tmp = '';
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

    tmp += '<br><br>\n';

    body += `### ${keyinfo} - Total Amount(${totalAmount.toFixed(3)}), Count(${
      value.length
    }) \n`;
    body += tmp;
  }

  console.log(body);
  steem.broadcast.comment(
    key.happyberrysboy_posting,
    '',
    'sct',
    'happyberrysboy',
    `happyberrysboy-mining-report-${dateString}`,
    title,
    body,
    { tags: ['sct', 'zzan', 'liv', 'jjm', 'weed', 'leo'], app: '' },
    function(err, result) {
      console.log(err, result);
    },
  );
});

Date.prototype.addHours = function(h) {
  this.setHours(this.getHours() + h);
  return this;
};

Date.prototype.koreaDate = function() {
  this.setHours(this.getHours() + 9);
  return `${this.getFullYear()}-${this.getMonth() + 1}-${(
    this.getDate() + ''
  ).padStart(2, '0')} ${(this.getHours() + '').padStart(2, '0')}:${(
    this.getMinutes() + ''
  ).padStart(2, '0')}`;
};
