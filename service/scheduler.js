const schedule = require("node-schedule");
const maiPosting = require("../posting/mai.js");
const maiPostingFee = require("../posting/mai_postingfee.js");
const autoKrwpBurn = require("../posting/autoKRWP.js");

// mai님 포스팅
schedule.scheduleJob("0 13 * * *", async function () {
  console.log("================= start maikuraki posting ====================");
  maiPosting().then((result) => {
    console.log(result);
    console.log("end..............mai posting.................");
  });
});

schedule.scheduleJob("1 13 * * *", async function () {
  maiPostingFee().then((result) => {
    console.log(result);
    console.log("sent..............mai postingfee.................");
  });
});

schedule.scheduleJob("0 22 * * *", async function () {
  autoKrwpBurn().then((result) => {
    console.log(result);
    console.log("sent..............krwp burn.................");
  });
});
