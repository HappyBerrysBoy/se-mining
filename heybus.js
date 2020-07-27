const axios = require("axios");
const schedule = require("node-schedule");
const TelegramBot = require("node-telegram-bot-api");
const token = "1207462239:AAH5JQNj84DXzmk7rt4sd_N_blzHpE2Zbvw";
const bot = new TelegramBot(token, { polling: true });

bot.on("message", (msg) => {
  console.log(
    `id:${msg.from.id},
    first_name:${msg.from.first_name},
    username:${msg.from.username},
    is_bot:${msg.from.is_bot}
    text:${msg.text}`
  );

  //   const chatId = msg.chat.id;

  // send a message to the chat acknowledging receipt of their message
  //   bot.sendMessage(
  //     chatId,
  //     `반갑습니다. ${msg.from.first_name}님. 메아리(${msg.text})`
  //   );
});

const busstopList = {
  "71039": {
    busstopMap: {
      0: "오션초등학교",
      1: "한신휴플러스",
      2: "명호중고등학교",
      3: "부산한솔학교",
      4: "퀸덤아파트201동",
      5: "퀸덤아파트1-2단지",
      6: "명호초등학교",
      7: "극동스타클래스",
      8: "롯데캐슬",
      9: "호산나교회",
      10: "남명초등학교",
      11: "행복마을",
      12: "낙동강철새도래지",
      13: "전등",
      14: "진동",
      15: "동리",
      16: "명지새동네",
      17: "을숙도",
      18: "하단역",
      19: "하단역",
      20: "을숙도",
      21: "부산현대미술관",
      22: "명지시장",
      23: "명지새동네",
      24: "동리",
      25: "진동",
      26: "전등",
      27: "행복마을",
      28: "남명초등학교",
      29: "호산나교회",
      30: "롯데캐슬",
      31: "극동스타클래스",
      32: "명호초등학교",
      33: "퀸덤아파트1-2단지",
      34: "퀸덤아파트201동",
      35: "두산위브",
      36: "명호중고등학교",
      37: "한신휴플러스",
      38: "오션초등학교",
    },
  },
  "71030": {
    busstopMap: {
      0: "용원",
      1: "용원사거리",
      2: "부광산업",
      3: "해광테크",
      4: "경제자유구역청",
      5: "부림특수강",
      6: "백송강재",
      7: "서해식품",
      8: "빅벤",
      9: "풍국철강",
      10: "삼덕통상",
      11: "강서소방서 무성산업사",
      12: "녹산폐기물매립장",
      13: "신호하수처리장",
      14: "삼성자동차정문",
      15: "신호윌아파트105동",
      16: "녹산농협신호지소",
      17: "신호초등학교",
      18: "신호마을",
      19: "금강웰테크",
      20: "삼성자동차남문",
      21: "퀸덤아파트1-2단지",
      22: "명호초등학교",
      23: "극동스타클래스109동",
      24: "롯데캐슬아파트",
      25: "호산나교회",
      26: "남명초등학교",
      27: "행복마을",
      28: "낙동강철새도래지",
      29: "전등",
      30: "진동",
      31: "동리",
      32: "명지새동네",
      33: "을숙도",
      34: "하단역",
      35: "하단역",
      36: "을숙도",
      37: "부산현대미술관",
      38: "명지시장",
      39: "명지새동네",
      40: "동리",
      41: "진동",
      42: "전등",
      43: "행복마을",
      44: "남명초등학교",
      45: "호산나교회",
      46: "롯데캐슬아파트",
      47: "극동스타클래스109동",
      48: "명호초등학교",
      49: "퀸덤아파트1.2단지",
      50: "삼성자동차남문",
      51: "금강웰테크",
      52: "신호마을",
      53: "신호초등학교",
      54: "녹산농협신호지소",
      55: "신호윌아파트105동",
      56: "삼성자동차정문",
      57: "신호하수처리장",
      58: "녹산폐기물매립장",
      59: "강서소방서 무성산업사",
      60: "삼덕통상",
      61: "풍국철강",
      62: "빅벤",
      63: "서해식품",
      64: "백송강재",
      65: "부산협동상사",
      66: "자유구역청",
      67: "해광테크",
      68: "부광산업",
      69: "용원사거리",
    },
  },
  "71062": {
    0: "신호부영2차아파트",
    1: "의창수협",
    2: "신호부영5차아파트",
    3: "신호초등학교",
    4: "녹산농협신호지소",
    5: "신호윌아파트",
    6: "삼성자동차남문",
    7: "명지오션시티",
    8: "퀸덤아파트1.2단지",
    9: "명호초등학교",
    10: "극동스타클래스109동",
    11: "롯데캐슬아파트",
    12: "호산나교회",
    13: "남명초등학교",
    14: "낙동강철새도래지",
    15: "전등",
    16: "진동",
    17: "동리",
    18: "명지새동네",
    19: "을숙도",
    20: "하단역",
    21: "하단역",
    22: "을숙도",
    23: "부산현대미술관",
    24: "명지시장",
    25: "명지새동네",
    26: "동리",
    27: "진동",
    28: "전등",
    29: "행복마을",
    30: "남명초등학교",
    31: "호산나교회",
    32: "롯데캐슬아파트",
    33: "극동스타클래스109동",
    34: "명호초등학교",
    35: "퀸덤아파트1.2단지",
    36: "명지오션시티",
    37: "삼성자동차남문",
    38: "신호윌아파트",
    39: "녹산농협신호지소",
    40: "신호초등학교",
    41: "신호부영5차아파트",
    42: "의창수협",
    43: "신호부영2차아파트",
  },
};

const sendlist = [1255537650, 36227498];

const buslist = [
  { id: "71039", name: "20번버스", turningPoint: 19 },
  { id: "71030", name: "17번버스", turningPoint: 35 },
  { id: "71062", name: "9-2번버스", turningPoint: 21 },
];

//17번버스: https://map.naver.com/v5/api/bus/location?lang=ko&routeId=71030&caller=pc_map&dummy=${+new Date()}
//20번버스: https://map.naver.com/v5/api/bus/location?lang=ko&routeId=71039&caller=pc_map&dummy=${+new Date()}

// getBusstopInfo(71062);

let botOn = false;
let msgList = {};

bot.onText(/\/on/, async (m) => {
  botOn = true;
});

bot.onText(/\/off/, async (m) => {
  botOn = false;
  msgList = {};
});

schedule.scheduleJob("*/10 * * * * *", async function () {
  if (!botOn) return;

  for (const bus of buslist) {
    checkBus(bus);
  }
});

schedule.scheduleJob("15 22 * * 0-5", async function () {
  botOn = true;
  const today = new Date();

  let day = "";

  if (today.getDay() == 0) {
    day = "월요일";
  } else if (today.getDay() == 1) {
    day = "화요일";
  } else if (today.getDay() == 2) {
    day = "수요일";
  } else if (today.getDay() == 3) {
    day = "목요일";
  } else if (today.getDay() == 4) {
    day = "금요일";
  } else if (today.getDay() == 5) {
    day = "토요일";
  }

  sendMsgBot(`오늘은 즐거운 ${day}!! 출근 준비는 잘하고 있나요? ^^`);
});

function sendMsg(msg) {
  const plateNo = msg.split("-")[0];
  let thisMsg = "";

  if (Object.keys(msgList).indexOf(plateNo) == -1) {
    msgList[plateNo] = { msg: msg };
    sendMsgBot(msg);
  } else {
    const preMsg = msgList[plateNo].msg;

    if (preMsg == msg) return;

    msgList[plateNo].msg = msg;
    sendMsgBot(msg);
  }
}

function sendMsgBot(msg) {
  for (const id of sendlist) {
    bot.sendMessage(id, msg);
  }
}

async function checkBus(businfo) {
  const now = +new Date();

  axios
    .get(
      `https://map.naver.com/v5/api/bus/location?lang=ko&routeId=${businfo.id}&caller=pc_map&dummy=${now}`
    )
    .then((r) => {
      try {
        const list = r.data.message.result.busLocationList;

        if (list.length == 0) return;

        for (const busstop of list) {
          //   sendMsg(
          //     `${busstop.plateNo}-${businfo.name} 현재정거장:${
          //       busstopList[businfo.id].busstopMap[busstop.stationSeq]
          //     }`
          //   );
          if (businfo.id == "71039") {
            if (busstop.stationSeq <= 1) {
              sendMsg(
                `${busstop.plateNo}-${businfo.name}가 지금 막 바로 출발!!!!! 허리업!!!!`
              );
            } else if (busstop.stationSeq == 2) {
              sendMsg(
                `${busstop.plateNo}-${
                  businfo.name
                }가 지금 세번째 정거장!!!\r\n ${
                  busstopList[businfo.id].busstopMap[busstop.stationSeq]
                } 얼른 준비하시게!!`
              );
            }
            // else if (busstop.stationSeq == 3) {
            //   sendMsg(
            //     `${busstop.plateNo}-${
            //       businfo.name
            //     }가 지금 네번째 정거장!!!\r\n ${
            //       busstopList[businfo.id].busstopMap[busstop.stationSeq]
            //     } 뛰어야 되려나!???`
            //   );
            // } else if (busstop.stationSeq == 4) {
            //   sendMsg(
            //     `${busstop.plateNo}-${
            //       businfo.name
            //     }가 지금 다섯번째 정거장!!!\r\n ${
            //       busstopList[businfo.id].busstopMap[busstop.stationSeq]
            //     } 한정거장 남음!!!`
            //   );
            // }
            else if (busstop.stationSeq > 36) {
              sendMsg(
                `${busstop.plateNo}-${businfo.name}가 오션시티 차고지에 대기`
              );
            }
          } else if (businfo.id == "71030") {
            if (busstop.stationSeq == 15) {
              sendMsg(
                `${busstop.plateNo}-${businfo.name}가 신호동 진입!!!! 남은정류장 6개!!`
              );
            } else if (busstop.stationSeq == 18) {
              sendMsg(
                `${busstop.plateNo}-${businfo.name}가 신호동에서 두정거장 더 가면 신호대교!!!`
              );
            } else if (busstop.stationSeq == 20) {
              sendMsg(
                `${busstop.plateNo}-${businfo.name}가 ${
                  busstopList[businfo.id].busstopMap[busstop.stationSeq]
                } 지남, 신호대교진입!!! 잘 가고 있는가!?`
              );
            }
          } else if (businfo.id == "71062") {
            if (busstop.stationSeq == 4) {
              sendMsg(
                `${busstop.plateNo}-${businfo.name}가 윌더하이리히요!!! 곧 시노대교 시노대교~ 오~`
              );
            } else if (busstop.stationSeq == 6) {
              sendMsg(
                `${busstop.plateNo}-${businfo.name}가 삼승자동차 정문을 지남~ 행복허자~~ 행복허자아~ 우리~ 아프지 말고우~`
              );
            }
          }
        }
      } catch (err) {
        // console.log(err);
        // throw "조회결과가 존재하지 않습니다.";
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

function getBusstopInfo(buscode) {
  axios
    .get(
      `https://map.naver.com/v5/api/transit/bus/routes/${buscode}?lang=ko&caller=naver_map&output=json`
    )
    .then((r) => {
      try {
        const turningpoint = r.data.turningPoint.stopIdx;
        const list = r.data.busStops;

        if (list.length == 0) return;

        let msg = "";
        for (let i = 0; i < list.length; i++) {
          msg += `${i}: "${list[i].displayName}",`;
        }

        console.log(msg);
        return;
      } catch (err) {
        console.log(err);
        throw "조회결과가 존재하지 않습니다.";
      }
    })
    .catch((err) => {
      console.log(err);
    });
}
