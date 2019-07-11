const steem = require('steem');
const config = require('../config.json');
const fs = require('fs');

const date = new Date();
date.setDate(date.getDate() - 1);
const year = date.getFullYear() + '';
const month = (date.getMonth() + 1 + '').padStart(2, '0');
const day = (date.getDate() + '').padStart(2, '0');
const dateString = `${year}-${month}-${day}`;

fs.readFile(`./logs/mining(${dateString}).txt`, 'utf8', function(err, data) {
  if (err) console.log(err);
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
    console.log(key + ' = ' + value);
  }
});
