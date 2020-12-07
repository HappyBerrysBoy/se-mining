const schedule = require("node-schedule");
const maiPosting = require("../posting/mai.js");

// mai님 포스팅
schedule.scheduleJob("0 13 * * *", async function () {
  console.log("================= start maikuraki posting ====================");
  maiPosting();
});

// schedule.scheduleJob("*/1 * * * *", async function () {
//   console.log(new Date());
// });
