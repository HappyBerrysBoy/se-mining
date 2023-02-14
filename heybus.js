const axios = require('axios');
const schedule = require('node-schedule');
const TelegramBot = require('node-telegram-bot-api');
const token = '1207462239:AAH5JQNj84DXzmk7rt4sd_N_blzHpE2Zbvw';
const bot = new TelegramBot(token, { polling: true });
const qs = require('qs');
const { readConfigFile, writeConfigFile } = require('./commfunc.js');

const memberFileName = 'memberList.json';
const adminID = 6151083556;
const mountainCourseMap = { 성판악: '242', 관음사: '244' };
// const memberList = [1255537650, 6151083556, 5292344781, 5117244716]; // 5292344781:박팀장님 ,5117244716:영옥대리
// const memberMap = {
//   1255537650: { name: "혀내", status: false },
//   6151083556: { name: "나!!", status: false },
//   5292344781: { name: "박팀장님", status: false },
//   5117244716: { name: "영옥대리", status: false },
// };

bot.on('message', msg => {
  const content = `
      Start Member
      id:${msg.from.id},
      first_name:${msg.from.first_name},
      username:${msg.from.username},
      is_bot:${msg.from.is_bot}
      text:${msg.text}`;

  console.log(content);

  if (msg.text === '/start') {
    sendMsgToAdmin(content);
  }
});

bot.onText(/\/help/, async m => {
  bot.sendMessage(
    m.chat.id,
    `✅ 한라산 알람 봇!!
사용법은 아래와 같습니다.
알람은 1개만 등록 가능합니다.(시간은 3개 모두 선택 가능)

- 한라산 알람 켜기
- 시간은 6시(5시30분) 출발은 "1", 8시 출발은 "2", 10시 출발은 "3", 모두다 등록시 all로 등록

명령어:/켜기 날짜 시간 코스

ex) /켜기 20220101 1 성판악
ex) /켜기 20220101 all 성판악

- 한라산 알람 끄기

명령어:/끄기

ex) /끄기 

- 관리자 전용 명령어
/register
/status
`,
  );
});

bot.onText(/\/status/, async m => {
  try {
    const members = await readConfigFile(memberFileName).then(r => {
      return r;
    });

    console.log('members', members);

    let msg = '';
    const keys = Object.keys(members);

    keys.forEach(i => {
      msg += `${i} : ${members[i].name}(${members[i].status})\r\n`;
    });

    sendMsgToAdmin(msg);
  } catch (err) {
    console.log(err);
  }
});

bot.onText(/\/register/, async m => {
  try {
    const commands = m.text.split(' ');
    const id = commands[1].toUpperCase();
    const name = commands[2].toUpperCase();

    const members = await readConfigFile(memberFileName).then(r => {
      return r;
    });

    members[id] = { name, status: false };

    await writeConfigFile(memberFileName, { ...members }).then(r => {
      return r;
    });

    sendMsgToAdmin(`${name}, ${id}`);
  } catch (err) {
    console.log(err);
  }
});

bot.onText(/\/켜기/, async m => {
  try {
    const commands = m.text.split(' ');
    const date = commands[1].toUpperCase();
    const time = commands[2].toUpperCase();
    const course = commands[3].toUpperCase();

    const members = await readConfigFile(memberFileName).then(r => {
      return r;
    });

    console.log('members', members);

    if (!members[m.chat.id]) {
      bot.sendMessage(m.chat.id, '등록되지 않은 유저');
      return;
    }

    const selCourse = mountainCourseMap[course];

    if (!selCourse) {
      bot.sendMessage(m.chat.id, '코스명이 잘못 되었습니다.');
      return;
    }

    if ('1 2 3 all'.indexOf(time.toLowerCase()) < 0) {
      bot.sendMessage(
        m.chat.id,
        '시간 설정이 잘못되었습니다.(1, 2, 3, all) 중에 하나여야합니다.',
      );
      return;
    }

    if (date.length !== 8) {
      bot.sendMessage(m.chat.id, '날짜 길이는 8자리로 입력해야합니다.');
      return;
    }

    let msg = '';
    members[m.chat.id].status = true;
    members[m.chat.id].date = date;
    members[m.chat.id].time = time;
    members[m.chat.id].course = course;

    await writeConfigFile(memberFileName, { ...members }).then(r => {
      return r;
    });

    bot.sendMessage(m.chat.id, '알람 등록 완료!!');
  } catch (err) {
    console.log(err);
    bot.sendMessage(m.chat.id, '알람 등록 실패!!');
  }
});

bot.onText(/\/끄기/, async m => {
  try {
    const commands = m.text.split(' ');

    const members = await readConfigFile(memberFileName).then(r => {
      return r;
    });

    if (!members[m.chat.id]) {
      bot.sendMessage(m.chat.id, '등록되지 않은 유저');
      return;
    }

    let msg = '';
    members[m.chat.id].status = false;
    members[m.chat.id].date = '';
    members[m.chat.id].time = '';
    members[m.chat.id].course = '';

    await writeConfigFile(memberFileName, { ...members }).then(r => {
      return r;
    });

    bot.sendMessage(m.chat.id, '알람 끄기 완료!!');
  } catch (err) {
    console.log(err);
    bot.sendMessage(m.chat.id, '알람 끄기 실패!!');
  }
});

const busstopList = {
  71039: {
    busstopMap: {
      0: '오션초등학교',
      1: '한신휴플러스',
      2: '명호중고등학교',
      3: '부산한솔학교',
      4: '퀸덤아파트201동',
      5: '퀸덤아파트1-2단지',
      6: '명호초등학교',
      7: '극동스타클래스',
      8: '롯데캐슬',
      9: '호산나교회',
      10: '남명초등학교',
      11: '행복마을',
      12: '낙동강철새도래지',
      13: '전등',
      14: '진동',
      15: '동리',
      16: '명지새동네',
      17: '을숙도',
      18: '하단역',
      19: '하단역',
      20: '을숙도',
      21: '부산현대미술관',
      22: '명지시장',
      23: '명지새동네',
      24: '동리',
      25: '진동',
      26: '전등',
      27: '행복마을',
      28: '남명초등학교',
      29: '호산나교회',
      30: '롯데캐슬',
      31: '극동스타클래스',
      32: '명호초등학교',
      33: '퀸덤아파트1-2단지',
      34: '퀸덤아파트201동',
      35: '두산위브',
      36: '명호중고등학교',
      37: '한신휴플러스',
      38: '오션초등학교',
    },
  },
  71030: {
    busstopMap: {
      0: '용원',
      1: '용원사거리',
      2: '부광산업',
      3: '해광테크',
      4: '경제자유구역청',
      5: '부림특수강',
      6: '백송강재',
      7: '서해식품',
      8: '빅벤',
      9: '풍국철강',
      10: '삼덕통상',
      11: '강서소방서 무성산업사',
      12: '녹산폐기물매립장',
      13: '신호하수처리장',
      14: '삼성자동차정문',
      15: '신호윌아파트105동',
      16: '녹산농협신호지소',
      17: '신호초등학교',
      18: '신호마을',
      19: '금강웰테크',
      20: '삼성자동차남문',
      21: '퀸덤아파트1-2단지',
      22: '명호초등학교',
      23: '극동스타클래스109동',
      24: '롯데캐슬아파트',
      25: '호산나교회',
      26: '남명초등학교',
      27: '행복마을',
      28: '낙동강철새도래지',
      29: '전등',
      30: '진동',
      31: '동리',
      32: '명지새동네',
      33: '을숙도',
      34: '하단역',
      35: '하단역',
      36: '을숙도',
      37: '부산현대미술관',
      38: '명지시장',
      39: '명지새동네',
      40: '동리',
      41: '진동',
      42: '전등',
      43: '행복마을',
      44: '남명초등학교',
      45: '호산나교회',
      46: '롯데캐슬아파트',
      47: '극동스타클래스109동',
      48: '명호초등학교',
      49: '퀸덤아파트1.2단지',
      50: '삼성자동차남문',
      51: '금강웰테크',
      52: '신호마을',
      53: '신호초등학교',
      54: '녹산농협신호지소',
      55: '신호윌아파트105동',
      56: '삼성자동차정문',
      57: '신호하수처리장',
      58: '녹산폐기물매립장',
      59: '강서소방서 무성산업사',
      60: '삼덕통상',
      61: '풍국철강',
      62: '빅벤',
      63: '서해식품',
      64: '백송강재',
      65: '부산협동상사',
      66: '자유구역청',
      67: '해광테크',
      68: '부광산업',
      69: '용원사거리',
    },
  },
  71062: {
    0: '신호부영2차아파트',
    1: '의창수협',
    2: '신호부영5차아파트',
    3: '신호초등학교',
    4: '녹산농협신호지소',
    5: '신호윌아파트',
    6: '삼성자동차남문',
    7: '명지오션시티',
    8: '퀸덤아파트1.2단지',
    9: '명호초등학교',
    10: '극동스타클래스109동',
    11: '롯데캐슬아파트',
    12: '호산나교회',
    13: '남명초등학교',
    14: '낙동강철새도래지',
    15: '전등',
    16: '진동',
    17: '동리',
    18: '명지새동네',
    19: '을숙도',
    20: '하단역',
    21: '하단역',
    22: '을숙도',
    23: '부산현대미술관',
    24: '명지시장',
    25: '명지새동네',
    26: '동리',
    27: '진동',
    28: '전등',
    29: '행복마을',
    30: '남명초등학교',
    31: '호산나교회',
    32: '롯데캐슬아파트',
    33: '극동스타클래스109동',
    34: '명호초등학교',
    35: '퀸덤아파트1.2단지',
    36: '명지오션시티',
    37: '삼성자동차남문',
    38: '신호윌아파트',
    39: '녹산농협신호지소',
    40: '신호초등학교',
    41: '신호부영5차아파트',
    42: '의창수협',
    43: '신호부영2차아파트',
  },
};

const buslist = [
  { id: '71039', name: '20번버스', turningPoint: 19 },
  { id: '71030', name: '17번버스', turningPoint: 35 },
  { id: '71062', name: '9-2번버스', turningPoint: 21 },
];

//17번버스: https://map.naver.com/v5/api/bus/location?lang=ko&routeId=71030&caller=pc_map&dummy=${+new Date()}
//20번버스: https://map.naver.com/v5/api/bus/location?lang=ko&routeId=71039&caller=pc_map&dummy=${+new Date()}

// getBusstopInfo(71062);

let botOn = false;
let msgList = {};

bot.onText(/\/on/, async m => {
  if ([6151083556, 1255537650].includes(m.chat.id)) {
    botOn = true;
    sendBusMsg('버스 알람 봇 켜짐!!');
  }
});

bot.onText(/\/off/, async m => {
  if ([6151083556, 1255537650].includes(m.chat.id)) {
    botOn = false;
    msgList = {};
    sendBusMsg('버스 알람 봇 끔!!!!');
  }
});

schedule.scheduleJob('*/10 * * * * *', async function () {
  if (!botOn) return;

  for (const bus of buslist) {
    checkBus(bus);
  }
});

schedule.scheduleJob('15 22 * * 0-5', async function () {
  // botOn = true;
  const today = new Date();

  let day = '';

  if (today.getDay() == 0) {
    day = '월요일';
  } else if (today.getDay() == 1) {
    day = '화요일';
  } else if (today.getDay() == 2) {
    day = '수요일';
  } else if (today.getDay() == 3) {
    day = '목요일';
  } else if (today.getDay() == 4) {
    day = '금요일';
  } else if (today.getDay() == 5) {
    day = '토요일';
  }

  // sendBusMsg(`오늘은 즐거운 ${day}!! 출근 준비는 잘하고 있나요? ^^`);
});

let callIdx = 0;

async function jejuAlarm(time) {
  const members = await readConfigFile(memberFileName).then(r => {
    return r;
  });

  const keys = Object.keys(members);
  const onList = keys.filter(key => {
    return members[key].status;
  });

  if (onList.length) {
    for (let i = 0; i < onList.length; i++) {
      const member = onList[i];
      if (members[member].time === time || members[member].time.toLowerCase() === 'all') {
        jejudo(members[member].date, time, members[member].course, member);
      }
    }
  }
}

schedule.scheduleJob('10 * * * * *', async function () {
  jejuAlarm('1');
});
schedule.scheduleJob('20 * * * * *', async function () {
  jejuAlarm('3');
});
schedule.scheduleJob('30 * * * * *', async function () {
  jejuAlarm('5');
});

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

function getEnteranceTime(idx) {
  if (idx === '1') {
    return '06~08';
  } else if (idx === '3') {
    return '08~10';
  } else if (idx === '5') {
    return '10~12';
  }
}

async function jejudo(date, time, course, chatid) {
  const data = qs.stringify({
    courseSeq: mountainCourseMap[course],
    visitDt: date,
    visitTm: 'TIME' + time,
  });

  await axios
    .post('https://visithalla.jeju.go.kr/reservation/coursePersonAjax.do', data)
    .then(r => {
      const reserveCnt = r.data.coursePerson.reserveCnt;
      const limitCnt = r.data.coursePerson.limitCnt;

      if (callIdx % 800 == 0) {
        sendMsgToChatid(chatid, `봇은 돌고 있어요..!!`);
      }

      if (reserveCnt < limitCnt) {
        sendMsgToChatid(
          chatid,
          `${getEnteranceTime(
            time,
          )}시 입장가능(${date}, ${course}) 제주도 예약 언능하셈요!!!\r\n현재 예약자수:${reserveCnt}`,
        );
      }
      // else {
      //   sendMsgToChatid(
      //     chatid,
      //     `${reserveCnt}/${limitCnt} 자리 음스효!(${time}, ${date}), ${course}`
      //   );
      // }

      callIdx++;
    })
    .catch(err => {
      sendMsgToAdmin(`봇 에러 뜸! 체크 필요`);
      console.log(err);
    });
}

function sendMsg(msg) {
  const plateNo = msg.split('-')[0];
  let thisMsg = '';

  if (Object.keys(msgList).indexOf(plateNo) == -1) {
    msgList[plateNo] = { msg: msg };
    sendBusMsg(msg);
  } else {
    const preMsg = msgList[plateNo].msg;

    if (preMsg == msg) return;

    msgList[plateNo].msg = msg;
    sendBusMsg(msg);
  }
}

function sendMsgToAdmin(msg) {
  bot.sendMessage(adminID, msg);
}

function sendMsgToChatid(id, msg) {
  bot.sendMessage(id, msg);
}

function sendBusMsg(msg) {
  bot.sendMessage('1255537650', msg);
  sendMsgToAdmin(msg);
}

async function checkBus(businfo) {
  const now = +new Date();

  axios
    .get(
      `https://map.naver.com/v5/api/bus/location?lang=ko&routeId=${businfo.id}&caller=pc_map&dummy=${now}`,
    )
    .then(r => {
      try {
        const list = r.data.message.result.busLocationList;

        if (list.length == 0) return;

        for (const busstop of list) {
          //   sendMsg(
          //     `${busstop.plateNo}-${businfo.name} 현재정거장:${
          //       busstopList[businfo.id].busstopMap[busstop.stationSeq]
          //     }`
          //   );
          if (businfo.id == '71039') {
            if (busstop.stationSeq <= 1) {
              sendMsg(
                `${busstop.plateNo}-${businfo.name}가 지금 막 바로 출발!!!!! 허리업!!!!`,
              );
            } else if (busstop.stationSeq == 2) {
              sendMsg(
                `${busstop.plateNo}-${businfo.name}가 지금 세번째 정거장!!!\r\n ${
                  busstopList[businfo.id].busstopMap[busstop.stationSeq]
                } 얼른 준비하시게!!`,
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
              sendMsg(`${busstop.plateNo}-${businfo.name}가 오션시티 차고지에 대기`);
            }
          } else if (businfo.id == '71030') {
            if (busstop.stationSeq == 15) {
              sendMsg(
                `${busstop.plateNo}-${businfo.name}가 신호동 진입!!!! 남은정류장 6개!!`,
              );
            } else if (busstop.stationSeq == 18) {
              sendMsg(
                `${busstop.plateNo}-${businfo.name}가 신호동에서 두정거장 더 가면 신호대교!!!`,
              );
            } else if (busstop.stationSeq == 20) {
              sendMsg(
                `${busstop.plateNo}-${businfo.name}가 ${
                  busstopList[businfo.id].busstopMap[busstop.stationSeq]
                } 지남, 신호대교진입!!! 잘 가고 있는가!?`,
              );
            }
          } else if (businfo.id == '71062') {
            if (busstop.stationSeq == 4) {
              sendMsg(
                `${busstop.plateNo}-${businfo.name}가 윌더하이리히요!!! 곧 시노대교 시노대교~ 오~`,
              );
            } else if (busstop.stationSeq == 6) {
              sendMsg(
                `${busstop.plateNo}-${businfo.name}가 삼승자동차 정문을 지남~ 행복허자~~ 행복허자아~ 우리~ 아프지 말고우~`,
              );
            }
          }
        }
      } catch (err) {
        // console.log(err);
        // throw "조회결과가 존재하지 않습니다.";
      }
    })
    .catch(err => {
      console.log(err);
    });
}

function getBusstopInfo(buscode) {
  axios
    .get(
      `https://map.naver.com/v5/api/transit/bus/routes/${buscode}?lang=ko&caller=naver_map&output=json`,
    )
    .then(r => {
      try {
        const turningpoint = r.data.turningPoint.stopIdx;
        const list = r.data.busStops;

        if (list.length == 0) return;

        let msg = '';
        for (let i = 0; i < list.length; i++) {
          msg += `${i}: "${list[i].displayName}",`;
        }

        console.log(msg);
        return;
      } catch (err) {
        console.log(err);
        throw '조회결과가 존재하지 않습니다.';
      }
    })
    .catch(err => {
      console.log(err);
    });
}
