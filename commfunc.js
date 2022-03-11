const fs = require("fs");

function writeLogFile(timestamp, name, json) {
  fs.appendFile(
    `./logs/${name}_${timestamp.split("T")[0]}.txt`,
    JSON.stringify(json) + "\n",
    err => {
      if (err) console.log(err);
    }
  );
}

function readConfigFile(filepath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filepath, "utf8", function(err, data) {
      if (err) {
        reject(new Error(`Fail to load lastBlock.json`));
        return;
      }
      resolve(JSON.parse(data));
    });
  });
}

function writeConfigFile(filepath, json) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filepath, JSON.stringify(json), err => {
      if (err) {
        reject(`Fail to save lastBlock.json`);
        return;
      }
      resolve();
    });
  });
}

function getDate(addHours) {
  const date = new Date();
  date.setHours(date.getHours() + addHours);
  const year = date.getFullYear() + "";
  const month = (date.getMonth() + 1 + "").padStart(2, "0");
  const day = (date.getDate() + "").padStart(2, "0");
  return `${year}-${month}-${day}`;
}

module.exports = {
  writeLogFile,
  readConfigFile,
  writeConfigFile,
  getDate
};
