const axios = require('axios');
const steem = require('steem');
const key = require('../key.json');

const account = 'happyberrysboy';
// const planetId = 'P-ZA01QNQO29C';   // alpha
const planetId = 'P-ZO75DZDVRUO'; // Beta
const type = 'explorespace';
const planetX = -9;
const planetY = -180;
const searchLeft = true;
const searchRight = true;
const searchTop = true;
const searchBottom = true;

function chkAvailExplorePoint(array, point) {
  return !array.some(function(element) {
    return point.x === element.x && point.y === element.y;
  });
}

function searchTarget(targetPoint, explore, explored, planets) {
  //   console.log(`Search Point:${targetPoint.x}, ${targetPoint.y}`);
  availExplore = true;
  availExplore = chkAvailExplorePoint(explored, targetPoint);
  if (availExplore) {
    availExplore = chkAvailExplorePoint(explore, targetPoint);
  }
  if (availExplore) {
    availExplore = chkAvailExplorePoint(planets, targetPoint);
  }

  return availExplore;
}

function chkAvailExplorefromDistance(
  centerPointX,
  centerPointY,
  distance,
  explore,
  explored,
  planets,
) {
  console.log(`Distance:${distance}`);

  let targetPoint = {};
  let availExplore = true;

  for (let i = 0; i < distance + 1; i++) {
    for (let j = 0; j < distance + 1; j++) {
      if (i + j != distance) continue;

      //   console.log(`i:${i},j:${j}`);
      targetPoint = { x: centerPointX - i, y: centerPointY - j };
      availExplore = searchTarget(targetPoint, explore, explored, planets);
      if (availExplore) break;

      targetPoint = { x: centerPointX + i, y: centerPointY - j };
      availExplore = searchTarget(targetPoint, explore, explored, planets);
      if (availExplore) break;

      targetPoint = { x: centerPointX + i, y: centerPointY + j };
      availExplore = searchTarget(targetPoint, explore, explored, planets);
      if (availExplore) break;

      targetPoint = { x: centerPointX - i, y: centerPointY + j };
      availExplore = searchTarget(targetPoint, explore, explored, planets);
      if (availExplore) break;
    }
    if (availExplore) break;
  }

  if (availExplore) {
    return targetPoint;
  } else {
    return {};
  }
}

axios
  .get(
    `https://nextcolony.io/api/loadgalaxy?x=${planetX}&y=${planetY}&height=120&width=120`,
  )
  .then(function(response) {
    // handle success
    // console.log(response);
    const data = response.data;
    const area = data.area;
    const explore = data.explore;
    const explored = data.explored;
    const planets = data.planets;

    const centerPointX = Math.floor((area.xmax + area.xmin) / 2);
    const centerPointY = Math.floor((area.ymax + area.ymin) / 2);

    // X min~max 범위는 120칸, Y도 마찬가지
    // 중간위치(행성위치) 부터 가까운 거리부터 explore와 planets에 포함 되지 않는 위치로 보낸다.
    // 가운데에서 위 아래 좌 우 가까운 위치로 보낸다.

    let targetPoint = {};
    let availExplore = true;
    // 최대 120칸 거리까지 검색
    for (let i = 1; i < 120; i++) {
      targetPoint = chkAvailExplorefromDistance(
        centerPointX,
        centerPointY,
        i,
        explore,
        explored,
        planets,
      );

      if (Object.keys(targetPoint).length) {
        console.log(targetPoint);
        break;
      }
    }

    // Nextcolony Explore
    if (availExplore) {
      steem.broadcast.customJson(
        key.happyberrysboy_posting, // posting key
        [],
        [account], // account
        'nextcolony', // 'nextcolony'
        `{"username":"${account}","type":"${type}","command":{"tr_var1":"${planetId}","tr_var2":"${
          targetPoint.x
        }","tr_var3":"${targetPoint.y}"}}`, // content json stringfy
        function(err, result) {
          console.log(err, result);
        },
      );
    } else {
      console.log('Can not find available explore point');
    }
  })
  .catch(function(error) {
    // handle error
    console.log(error);
  })
  .finally(function() {
    // always executed
  });
