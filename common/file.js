const fs = require("fs");

exports.writeFile = (fullFilePath, jsonData) => {
  fs.writeFile(fullFilePath, JSON.stringify(jsonData), err => {
    if (err) console.log(err);
    console.log("The file has been saved!");
  });
};

exports.readFile = fullFilePath => {
  fs.readFile(fullFilePath, "utf8", function(err, data) {
    console.log(fullFilePath);
    if (err) console.log(err);
    return data;
  });
};

exports.readFileJson = fullFilePath => {
  fs.readFile(fullFilePath, "utf8", function(err, data) {
    if (err) console.log(err);
    return JSON.parse(data);
  });
};
