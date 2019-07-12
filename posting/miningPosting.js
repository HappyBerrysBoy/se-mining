const steem = require('steem');
const config = require('../config.json');
const fs = require('fs');

const date = new Date();
date.setDate(date.getDate() - 1); // 하루전..
const year = date.getFullYear() + '';
const month = (date.getMonth() + 1 + '').padStart(2, '0');
const day = (date.getDate() + '').padStart(2, '0');
const dateString = `${year}-${month}-${day}`;

const title = `${dateString} Mining Information`;
let body = `# Last Day Steem Engine Mining Information \n<br>\n`;

fs.readFile(`./logs/mining(${dateString}).txt`, 'utf8', function(err, data) {
  if (err) {
    console.log(err);
    return;
  }
  const map = new Map();

  data.split('\n').forEach(data => {
    if (!data.trim().length) return;

    const json = JSON.parse(data);
    if (!map.has(json.symbol)) {
      map.set(json.symbol, [json]);
    } else {
      map.get(json.symbol).push(json);
    }
  });

  for (var [key, value] of map.entries()) {
    // console.log(key + ' = ' + value);
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

    body += `### ${key} - Total Amount(${totalAmount.toFixed(3)}), Count(${
      value.length
    }) \n`;
    body += tmp;
  }

  console.log(body);
});

Date.prototype.addHours = function(h) {
  this.setHours(this.getHours() + h);
  return this;
};

Date.prototype.koreaDate = function() {
  this.setHours(this.getHours() + 9);
  return `${this.getFullYear()}-${this.getMonth() +
    1}-${this.getDate()} ${this.getHours()}:${this.getMinutes()}`;
};

// {"symbol":"SCT","type":"mining","N":10,"staked_mining_power":325235.8440000001,"winner":["kcc","uzgo","sctm.winners","omit","bizventurer","corn113","kcc","kcc","gaeteol","omit"],"claim_token_amount":8.02,"trx_id":"acf38c09a895a79285faff2c451c21bd8a95a582","block_num":34561850,"N_accounts":116,"timestamp":"2019-07-11T06:55:57","blocknumber":34561853}
// {"symbol":"ENG","type":"mining","N":10,"staked_mining_power":4025.45456,"winner":["goodhello","chairmanlee","kopasi","uzgo","chairmanlee","ramires","ramires","ramires","chairmanlee","fantasycrypto"],"claim_token_amount":1.2,"trx_id":"446fea4edbeb0ecf2990ab950e46e7520b0929b6","block_num":34561953,"N_accounts":116,"timestamp":"2019-07-11T07:01:15","blocknumber":34561959}
