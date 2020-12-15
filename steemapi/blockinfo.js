const steem = require("steem");
const config = require("../config.json");
const fs = require("fs");
const key = require("../key.json");
const SSC = require("sscjs");
const axios = require("axios");
const dateFormat = require("dateformat");
const ssc = new SSC("https://steemapi.cryptoempirebot.com/rpc/");
const TelegramBot = require("node-telegram-bot-api");
// const ncUsers = require("../ncUsers.json");
// For a description of the Bot API, see this page: https://core.telegram.org/bots/api

const useTelegramBot = true;
const useHappyDice = false;
const useHappyPick = true;
const useMining = true;

const serviceAccount = "steemservice";
const postingKey = key.steemservice_posting;

const token = "918252456:AAEM4eW8Dk5bDzc2XuXPh5vHDtckMOXyw-U"; // nc_bot
const warningToken = "1036763519:AAFIImhUu_q7MFOYzsX6-46KebVD7SAy5x0";
const yamatoToken = "1229060737:AAGvC5jDS8kSKEwu4Hbn05F3nppCgGJg1hk";
// const token = "901594819:AAGd3ZT2R0886C2Dr9eF2m1nUTrgHng4I84"; // happytest2_bot

const bot = new TelegramBot(token, { polling: true });
const warningbot = new TelegramBot(warningToken, { polling: true });
const yamatobot = new TelegramBot(yamatoToken, { polling: true });

const nextColonyMinitoringCommand = ["attack", "cancel", "deploy", "siege"];
// const telegramMembers = [];
// ncUsers.telegramMembers.forEach(u => {
//   telegramMembers.push(u.id);
// });

bot.on("message", (msg) => {
  console.log(
    `id:${msg.from.id},
    first_name:${msg.from.first_name},
    username:${msg.from.username},
    is_bot:${msg.from.is_bot}
    text:${msg.text}`
  );

  // if (!telegramMembers.includes(msg.from.id)) return;

  const chatId = msg.chat.id;

  // send a message to the chat acknowledging receipt of their message
  bot.sendMessage(
    chatId,
    `반갑습니다. ${msg.from.first_name}님. 메아리(${msg.text})`
  );
});

warningbot.on("message", (msg) => {
  console.log(
    `id:${msg.from.id},
    first_name:${msg.from.first_name},
    username:${msg.from.username},
    is_bot:${msg.from.is_bot}
    text:${msg.text}`
  );

  // if (!telegramMembers.includes(msg.from.id)) return;

  const chatId = msg.chat.id;

  // send a message to the chat acknowledging receipt of their message
  warningbot.sendMessage(
    chatId,
    `반갑습니다. ${msg.from.first_name}님. 메아리(${msg.text})`
  );
});

yamatobot.on("message", (msg) => {
  console.log(
    `id:${msg.from.id},
    first_name:${msg.from.first_name},
    username:${msg.from.username},
    is_bot:${msg.from.is_bot}
    text:${msg.text}`
  );

  // if (!telegramMembers.includes(msg.from.id)) return;

  const chatId = msg.chat.id;

  // send a message to the chat acknowledging receipt of their message
  yamatobot.sendMessage(
    chatId,
    `반갑습니다. ${msg.from.first_name}님. 메아리(${msg.text})`
  );
});

const loadGalaxy = (planetX, planetY) => {
  return axios.get(
    `https://api.nextcolony.io/loadgalaxy?x=${planetX}&y=${planetY}&height=1&width=1`
  );
};

const fleetMission = (account) => {
  return axios.get(
    `https://api.nextcolony.io/loadfleetmission?user=${account}&active=1`
  );
};

const fleetPlanetMission = (account, planet) => {
  return axios.get(
    `https://api.nextcolony.io/loadfleetmission?user=${account}&planetid=${planet}`
  );
};

const loadplanet = (planetId) => {
  return axios.get(`https://api.nextcolony.io/loadplanet?id=${planetId}`);
};

const loadFleet = (account, planet) => {
  return axios.get(
    `https://api.nextcolony.io/loadfleet?user=${account}&planetid=${planet}`
  );
};

const findPlanet = () => {
  return axios.get(
    `https://api.nextcolony.io/loadplanets?sort=date&from=0&to=1`
  );
};

const getContent = (author, permlink) => {
  return new Promise((resolve, reject) => {
    steem.api.getContent(author, permlink, (err, result) => {
      if (err) {
        reject(new Error(`Fail to load getContent(${author}, ${permlink})`));
        return;
      }

      if (!result.body.length) {
        reject(new Error(`Invalid permlink(${author}, ${permlink})`));
        return;
      }

      resolve(result);
    });
  });
};

fs.readFile("../config/blockConfig.ini", "utf8", function (err, data) {
  if (err) console.log(err);
  const json = JSON.parse(data);
  console.log(json.lastReadSteemBlock);
  getBlock(json);
});

async function getBlock(json) {
  console.log("start : " + json.lastReadSteemBlock);

  setInterval(blockMonitoring, 1500, json);
}

async function readFileFunc(filepath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filepath, "utf8", function (err, data) {
      if (err) console.log(err);
      resolve(JSON.parse(data));
    });
  }).then((r) => {
    return r;
  });
}

async function blockMonitoring(blockno) {
  let ncUsers;
  ncUsers = await readFileFunc("../ncUsers.json");

  const telegramMembers = [];
  ncUsers.telegramMembers.forEach((u) => {
    telegramMembers.push(u.id);
  });

  const date = new Date();
  // AWS 시간이 UTC 기준이라 국내보다 9시간 늦음 그래서 강제로 9시간 빠르게 돌림
  date.setHours(date.getHours() + 9);
  const year = date.getFullYear() + "";
  const month = (date.getMonth() + 1 + "").padStart(2, "0");
  const day = (date.getDate() + "").padStart(2, "0");
  const dateString = `${year}-${month}-${day}`;

  if (blockno.lastReadSteemBlock % 30 == 0) {
    console.log(`Block No:${blockno.lastReadSteemBlock}`);
  }

  let blockinfo = await steem.api.getBlockAsync(blockno.lastReadSteemBlock);

  if (blockinfo == null) {
    return;
  }

  let timestamp;
  let transactions;

  try {
    timestamp = blockinfo.timestamp;
    transactions = blockinfo.transactions;
  } catch (e) {
    console.log(e);
    console.log(`const { timestamp = null, transactions } = blockinfo error`);
    fs.appendFile(
      "../logs/exceptions(" + dateString + ").txt",
      JSON.stringify(blockinfo) + "\n",
      (err) => {
        if (err) console.log(err);
      }
    );
  }

  // if (transactions.length == 0 && retryCount < 5) return;

  transactions.forEach(async (transaction) => {
    const { operations, signatures } = transaction;
    const action = operations[0][0];
    const content = operations[0][1];
    content.block = blockno.lastReadSteemBlock;
    content.timestamp = timestamp;

    try {
      let aa = JSON.stringify(content).toLowerCase().includes("sct");
    } catch (e) {
      console.log(e);
    }

    if (action === "custom_json") {
      try {
        const jsonInfo = JSON.parse(content.json);
        jsonInfo.timestamp = timestamp;
        jsonInfo.block = blockno.lastReadSteemBlock;

        if (blockno.lastReadSteemBlock % 10 == 0) {
          findPlanet().then((p) => {
            if (blockno.lastPlanetUser != p.data.planets[0].username) {
              const foundPlanet = p.data.planets[0];
              let sendMsg = `*******행성발견*******\n${foundPlanet.username}(${foundPlanet.id})\n${foundPlanet.name}(${foundPlanet.posx},${foundPlanet.posy})\n*********************\n`;
              blockno.lastPlanetUser = p.data.planets[0].username;
              telegramMembers.forEach((m) => bot.sendMessage(m, sendMsg));
            }
          });
        }

        if (useTelegramBot && content.id == "nextcolony") {
          // siege, attack인 경우 여기 등록된 계정에 공격 받는사람이 있는지 체크
          if (jsonInfo.type == "siege" || jsonInfo.type == "attack") {
            const planetid = jsonInfo.command.tr_var4;

            const targetPlanetInfo = await loadGalaxy(
              jsonInfo.command.tr_var2,
              jsonInfo.command.tr_var3
            );

            const missions = await fleetPlanetMission(
              jsonInfo.username,
              planetid
            );

            const thisMission = missions.data.find(
              (m) =>
                m.type == jsonInfo.type &&
                m.end_x == jsonInfo.command.tr_var2 &&
                m.end_y == jsonInfo.command.tr_var3
            );

            for (let i = 0; i < ncUsers.telegramMembers.length; i++) {
              const ncUser = ncUsers.telegramMembers[i];
              const targetAccountList = ncUser.targetAccountList;

              // console.log("siege/attack log", thisMission);

              if (
                targetAccountList.includes(
                  targetPlanetInfo.data.planets[0].user
                )
              ) {
                let arrTime = 0;
                let retTime = 0;

                if (thisMission) {
                  arrTime = new Date(thisMission.arrival * 1000);
                  retTime = new Date(thisMission.return * 1000);

                  sendMsg = `====비상비상====\nAccount:${
                    jsonInfo.username
                  }  \nType:${jsonInfo.type}(${
                    thisMission.id
                  })\nArr:${dateFormat(arrTime, "mm/dd HH:MM:ss")}, Ret:${
                    thisMission.return
                      ? dateFormat(retTime, "mm/dd HH:MM:ss")
                      : "-"
                  }  \nShips:${JSON.stringify(
                    jsonInfo.command.tr_var1
                  )}  \nFrom:${planetid}(${thisMission.from_planet.name}, ${
                    thisMission.start_x
                  }, ${thisMission.start_y})\nTo:${
                    thisMission.to_planet.user
                  }(${thisMission.to_planet.id}(${
                    thisMission.to_planet.name
                  }), ${jsonInfo.command.tr_var2}, ${
                    jsonInfo.command.tr_var3
                  })`;
                } else {
                  sendMsg = `====비상비상====\nAccount:${
                    jsonInfo.username
                  }  \nType:${jsonInfo.type}\nShips:${JSON.stringify(
                    jsonInfo.command.tr_var1
                  )}  \nFrom:${planetid}\nTo:${
                    targetPlanetInfo.data.planets[0].user
                  }(${targetPlanetInfo.data.planets[0].id}, ${
                    targetPlanetInfo.data.planets[0].x
                  }, ${targetPlanetInfo.data.planets[0].y})`;
                }

                if (sendMsg) {
                  // console.log(ncUser.id, thisMission.to_planet.user, sendMsg);
                  warningbot.sendMessage(ncUser.id, sendMsg);
                }
              }
            }
          } else if (jsonInfo.type == "upgradeyamato") {
            // loadplanet(planet.id),
            const planetid = jsonInfo.command.tr_var1;
            const level = jsonInfo.command.tr_var2;
            const username = jsonInfo.username;

            if (username != "rivalzzz" && username != "mancer-sm-alt") {
              const planetInfo = await loadplanet(planetid);
              const loca =
                planetInfo.data.planet_corx + "," + planetInfo.data.planet_cory;

              sendMsg = `====야마토 업그레이두====\nUser:${username}\nLocation:(${loca})\nPlanet:${planetInfo.data.planet_name}(${planetid})\nLevel:${level}\nBlock:${jsonInfo.block}`;

              if (sendMsg) {
                console.log(sendMsg);
                yamatobot.sendMessage(454924368, sendMsg); // 454924368 : youthme
                console.log("=====sent youthme=====");
                yamatobot.sendMessage(36227498, sendMsg); // 454924368 : youthme
                console.log("=====sent happyberrysboy=====");
              }
            }
          }

          for (let i = 0; i < ncUsers.telegramMembers.length; i++) {
            const ncUser = ncUsers.telegramMembers[i];
            const nextColonyMonitoringId = ncUser.nextColonyMonitoringId;

            if (
              nextColonyMonitoringId.includes(jsonInfo.username) &&
              nextColonyMinitoringCommand.includes(jsonInfo.type)
            ) {
              // console.log("monitoring id list", jsonInfo);
              // {"username":"strikeeagle","type":"siege","command":{"tr_var1":{"frigate1":{"pos":1,"n":30}},"tr_var2":-294,"tr_var3":116,"tr_var4":"P-ZBVFMCH4HEO"}}

              let sendMsg = "";

              if (jsonInfo.type == "cancel") {
                const missions = await fleetMission(jsonInfo.username);
                const target = missions.data.filter(
                  (m) => m.id == jsonInfo.command.tr_var1
                );

                if (target.length) {
                  let tmpTime = new Date(target[0].arrival * 1000);

                  sendMsg = `Account:${jsonInfo.username}  \nType:${
                    jsonInfo.type
                  }(ArrTime:${dateFormat(
                    tmpTime,
                    "mm/dd HH:MM:ss"
                  )})  \nMission:${jsonInfo.command.tr_var1}`;
                } else {
                  sendMsg = `Account:${jsonInfo.username}  \nType:${jsonInfo.type}(${jsonInfo.timestamp})  \nMission:${jsonInfo.command.tr_var1}`;
                }
              } else {
                // deploy, attack, siege
                const planetid =
                  jsonInfo.type == "deploy"
                    ? jsonInfo.command.tr_var8
                    : jsonInfo.command.tr_var4;

                const missions = await fleetPlanetMission(
                  jsonInfo.username,
                  planetid
                );

                const thisMission = missions.data.find(
                  (m) =>
                    m.type == jsonInfo.type &&
                    m.end_x == jsonInfo.command.tr_var2 &&
                    m.end_y == jsonInfo.command.tr_var3
                );

                let arrTime = new Date(thisMission.arrival * 1000);
                let retTime = new Date(thisMission.return * 1000);

                sendMsg = `Account:${jsonInfo.username}  \nType:${
                  jsonInfo.type
                }(${thisMission.id})\nArr:${dateFormat(
                  arrTime,
                  "mm/dd HH:MM:ss"
                )}, Ret:${
                  thisMission.return
                    ? dateFormat(retTime, "mm/dd HH:MM:ss")
                    : "-"
                }  \nShips:${JSON.stringify(
                  jsonInfo.command.tr_var1
                )}  \nFrom:${planetid}(${thisMission.from_planet.name}, ${
                  thisMission.start_x
                }, ${thisMission.start_y})\nTo:${thisMission.to_planet.user}(${
                  thisMission.to_planet.id
                }(${thisMission.to_planet.name}), ${
                  jsonInfo.command.tr_var2
                }, ${jsonInfo.command.tr_var3})`;
              }

              if (sendMsg) {
                bot.sendMessage(ncUser.id, sendMsg);
              }
            }
          }
        }

        // {"username":"kurade","type":"deploy","command":{"tr_var1":{"explorership":2},"tr_var2":-33,"tr_var3":-247,"tr_var4":0,"tr_var5":0,"tr_var6":0,"tr_var7":0,"tr_var8":"P-ZWRISNYRSV4"}}

        if (
          useMining &&
          content.id === config.customJsonList.mining &&
          jsonInfo.type === config.customJsonList.mining_type
        ) {
          const winner = jsonInfo.winner;
          const amount = jsonInfo.claim_token_amount;
          const miningPower = jsonInfo.staked_mining_power;
          const symbol = jsonInfo.symbol;
          const blockNum = jsonInfo.block_num;

          console.log("content :", jsonInfo);

          fs.appendFile(
            "../logs/mining(" + dateString + ").txt",
            JSON.stringify(jsonInfo) + "\n",
            (err) => {
              if (err) console.log(err);
            }
          );
          // {"service":"SE_MINING","content":"key:id, content:scot_claim","level":"info","message":"info","timestamp":"2019-06-25 01:42:46"}
          // {"service":"SE_MINING","content":"key:json, content:{\"symbol\":\"PAL\",\"type\":\"mining\",\"N\":9,\"staked_mining_power\":2313.0000000000005,\"winner\":[\"bitcoinflood\",\"jongolson\",\"michealb\",\"nuthman\",\"aggroed\",\"dylanhobalart\",\"dylanhobalart\",\"videosteemit\",\"steinreich\"],\"claim_token_amount\":2.067,\"trx_id\":\"4654e524c287b4354981587aea3a62f133da8648\",\"block_num\":34084567,\"N_accounts\":166}","level":"info","message":"info","timestamp":"2019-06-25 01:42:46"}
        }

        if (JSON.stringify(content).toLowerCase().includes("sct")) {
          // console.log('content :', content);

          fs.appendFile(
            "../logs/sct_log_" + timestamp.split("T")[0] + ".txt",
            JSON.stringify(content) + "\n",
            (err) => {
              if (err) console.log(err);
            }
          );
        }
      } catch (e) {
        console.log(e);
        fs.appendFile(
          "../logs/exceptions(" + dateString + ").txt",
          "retry count over\n",
          (err) => {
            if (err) console.log(err);
          }
        );
        return;
      }
    } else if (
      useHappyPick &&
      action === "comment" &&
      content.body.indexOf(config.pickTag) > -1
    ) {
      try {
        console.log(`${config.pickTag} : ${content.blocknumber}`);

        // 존재하는 포스팅 체크
        const postingInfo = await getContent(content.author, content.permlink)
          .then((p) => {
            return p;
          })
          .catch((e) => {
            throw new Error(e);
          });

        // 생성된 시간과 업데이트 시간이 다르면 수정된 글이라고 판단
        if (postingInfo.created != postingInfo.last_update) return;

        const hdata = content.body.split(config.pickTag)[1].match(/\((.*?)\)/g);
        let pickCnt = parseInt(
          content.body.split(config.pickTag)[1].split("(")[0].trim()
        );

        // 몇명 뽑는지 입력 안하면 1명으로 설정
        if (isNaN(pickCnt)) {
          pickCnt = 1;
        }

        const list = hdata[0].replace(/\(/g, "").replace(/\)/g, "").split(",");

        let pickAccount = [];
        let pickedNum = [];
        let accountList = [];
        let valList = [];
        let numOfTotalVal = 0;

        let participants = `\n\n내용:${hdata}\n\n참가 리스트\n`;
        list.forEach((a, idx) => {
          accountList.push(a.split(":")[0].replace(/ /g, ""));
          if (a.indexOf(":") > -1) {
            const tmpVal = parseInt(a.split(":")[1].replace(/ /g, ""));
            valList.push(tmpVal);
            numOfTotalVal += tmpVal;
          } else {
            valList.push(1);
            numOfTotalVal += 1;
          }

          participants += `${accountList[idx]}:${
            valList.length == 1 ? 1 : numOfTotalVal - valList[idx] + 1
          }~${numOfTotalVal}\n`;
        });

        if (!numOfTotalVal) {
          throw `Something is wrong.(BlockNo:${content.blocknumber})==>${list}`;
        }

        if (list.length < pickCnt) {
          pickCnt = list.length;
        }

        let body = `##### Happy Pick Result!!(Pick ${pickCnt} Item${
          pickCnt < 2 ? "" : "s"
        })\n\n`;
        body += participants;
        body += `\nRanking..!!\n`;

        while (pickAccount.length < pickCnt) {
          const theNumber = Math.floor(Math.random() * numOfTotalVal) + 1;
          let culmulativeNum = 1;
          let selIdx = -1;

          valList.forEach((val, idx) => {
            if (
              culmulativeNum <= theNumber &&
              culmulativeNum + parseInt(val) > theNumber &&
              pickAccount.indexOf(accountList[idx]) < 0
            ) {
              selIdx = idx;
              pickAccount.push(accountList[selIdx]);
              pickedNum.push(theNumber);
            }

            culmulativeNum += parseInt(val);
          });
        }

        pickAccount.forEach((acc, idx) => {
          body += `No${idx + 1}. ${acc}(${pickedNum[idx]})\n`;
        });

        // content
        steem.broadcast.comment(
          postingKey,
          content.author,
          content.permlink,
          serviceAccount,
          steem.formatter
            .commentPermlink(content.author, content.permlink)
            .replace(/\./g, "")
            .substring(0, 16) + Math.floor(Math.random() * 10000),
          "",
          body,
          content.json_metadata,
          function (err, result) {
            console.log(err, result);
          }
        );

        const logJson = { content: content, result: body };

        fs.appendFile(
          "../logs/happypick(" + dateString + ").txt",
          JSON.stringify(logJson) + "\n",
          (err) => {
            if (err) console.log(err);
          }
        );
      } catch (e) {
        console.log(e);
        steem.broadcast.comment(
          postingKey,
          content.author,
          content.permlink,
          serviceAccount,
          steem.formatter.commentPermlink(content.author, content.permlink),
          "",
          e,
          content.json_metadata,
          function (err, result) {
            console.log(err, result);
          }
        );
      }
    } else if (
      useHappyDice &&
      action === "comment" &&
      content.parent_author != "" &&
      content.body.indexOf(config.diceTag) > -1
    ) {
      console.log(`${config.pickTag}`);
      let startNo = 1;
      let endNo = 100;
      try {
        // 존재하는 포스팅 체크
        const postingInfo = await getContent(content.author, content.permlink)
          .then((p) => {
            return p;
          })
          .catch((e) => {
            throw new Error(e);
          });

        // 생성된 시간과 업데이트 시간이 다르면 수정된 글이라고 판단
        if (postingInfo.created != postingInfo.last_update) return;

        let options = content.body
          .split(config.diceTag)[1]
          .split("\n")[0]
          .trim();

        if (options) {
          if (options.indexOf("~") > -1) {
            startNo = parseInt(options.split("~")[0].trim());
            endNo = parseInt(options.split("~")[1].trim());
          } else {
            endNo = parseInt(options);
          }
        }

        if (startNo > endNo || isNaN(startNo) || isNaN(endNo)) {
          // content
          steem.broadcast.comment(
            postingKey,
            content.author,
            content.permlink,
            serviceAccount,
            steem.formatter
              .commentPermlink(content.author, content.permlink)
              .replace(/\./g, "")
              .substring(0, 16) + Math.floor(Math.random() * 10000),
            "",
            "올바르지 않은 숫자입니다.",
            content.json_metadata,
            function (err, result) {
              console.log(err, result);
            }
          );
          return;
        }

        const theNumber =
          Math.floor(Math.random() * (endNo - startNo + 1)) + startNo;
        let body = `##### Happy Dice Result!!\n`;
        body += `${content.author}님은 ${theNumber}을 뽑으셨습니다.`;

        // content
        steem.broadcast.comment(
          postingKey,
          content.author,
          content.permlink,
          serviceAccount,
          steem.formatter
            .commentPermlink(content.author, content.permlink)
            .replace(/\./g, "")
            .substring(0, 16) + Math.floor(Math.random() * 10000),
          "",
          body,
          content.json_metadata,
          function (err, result) {
            console.log(err, result);
          }
        );

        const logJson = { content: content, result: body };

        fs.appendFile(
          "../logs/happydice(" + dateString + ").txt",
          JSON.stringify(logJson) + "\n",
          (err) => {
            if (err) console.log(err);
          }
        );
      } catch (e) {
        console.log(`dice error`);
        console.log(e);

        steem.broadcast.comment(
          postingKey,
          content.author,
          content.permlink,
          serviceAccount,
          steem.formatter
            .commentPermlink(content.author, content.permlink)
            .replace(/\./g, "")
            .substring(0, 16) + Math.floor(Math.random() * 10000),
          "",
          e,
          content.json_metadata,
          function (err, result) {
            console.log(err, result);
          }
        );
        return;
      }
    }
  });

  blockno.lastReadSteemBlock += 1;

  fs.writeFile("../config/blockConfig.ini", JSON.stringify(blockno), (err) => {
    if (err) console.log(err);
  });
}
