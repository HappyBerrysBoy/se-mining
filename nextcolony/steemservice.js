const axios = require("axios");
const steem = require("steem");
const key = require("../key.json");

const account = "steemservice";
const postingkey = key.steemservice_posting;
const mineMinLevel = 11;
const mineGapVal = 0;
const shipyardArray = [
  { name: "A", id: "P-ZLRD1LQB8N4", ship: ["explorership"] },
];

// 리스트에 포함되면 업글 안함
const buildPlanetArray = [];

//탐험 관련 계정
const explorePlanetArray = [
  {
    name: "A",
    id: "P-ZLRD1LQB8N4",
    exploreCnt: 10,
    explorerDirection: {
      xminus: true,
      xplus: false,
      yminus: true,
      yplus: true,
    },
  },
];

const defaultSkillUpList = [
  { name: "missioncontrol", target: 20 },
  { name: "Explorer", target: 20 },
  { name: "uraniummine", target: 14 },
  { name: "coppermine", target: 13 },
  { name: "oremine", target: 13 },
  { name: "coalmine", target: 13 },
  { name: "coaldepot", target: 10 },
  { name: "oredepot", target: 10 },
  { name: "uraniumdepot", target: 10 },
  { name: "copperdepot", target: 10 },
  { name: "researchcenter", target: 10 },
  { name: "shipyard", target: 13 },
];

const skillUpArray = [
  // {
  //   name: "A",
  //   planet: "P-ZLRD1LQB8N4",
  //   skill: [
  //     { name: "missioncontrol", target: 20 },
  //     { name: "Explorer", target: 20 },
  //     { name: "shipyard", target: 13 }
  //   ]
  // }
];

let attackIdx = 0;
const attackList = [
  { id: "P-Z4F8YZE0XJ4", x: -543, y: 122 },
  { id: "P-ZTY87WKC52O", x: -546, y: 117 },
  { id: "P-Z2DEL2ENL34", x: -528, y: 110 },
  { id: "P-Z39X5A042K0", x: -531, y: 106 },
  { id: "P-ZAIUWOOL62O", x: -545, y: 115 },
  { id: "P-Z3TXPUXUCYO", x: -544, y: 143 },
  { id: "P-ZNYQLE6J81C", x: -543, y: 126 },
];

let buildArray = [];
let searchGalaxyArray = [];
let skillArray = [];
let shipArray = [];
let attackArray = [];

const exceptPoint = [{ x: -10, y: -170 }];
const maxBuildQty = {
  base: -1,
  shipyard: 13,
  researchcenter: 8,
  coalmine: 12,
  oremine: 12,
  coppermine: 12,
  uraniummine: 14,
  coaldepot: 9,
  oredepot: 9,
  copperdepot: 9,
  uraniumdepot: 9,
  bunker: -1,
  shieldgenerator: 1,
};

const exploreRange = {fromX:-9999, toX:9999, fromY:120, toY:140};

// Planet 정보
const loadplanets = account => {
  return axios.get(`https://api.nextcolony.io/loadplanets?user=${account}`);
};

const loadskills = account => {
  return axios.get(`https://api.nextcolony.io/loadskills?user=${account}`);
};

const loadplanet = planetId => {
  return axios.get(`https://api.nextcolony.io/loadplanet?id=${planetId}`);
};

const loadqyt = planetId => {
  return axios.get(`https://api.nextcolony.io/loadqyt?id=${planetId}`);
};

const loadbuilding = planetId => {
  return axios.get(`https://api.nextcolony.io/loadbuildings?id=${planetId}`);
};

const loadshipyard = planetId => {
  return axios.get(`https://api.nextcolony.io/shipyard?id=${planetId}`);
};

const loadproduction = (planetId, account) => {
  return axios.get(
    `https://api.nextcolony.io/loadproduction?id=${planetId}&user=${account}`,
  );
};

const loadGalaxy = (planetX, planetY) => {
  return axios.get(
    `https://api.nextcolony.io/loadgalaxy?x=${planetX}&y=${planetY}&height=120&width=120`,
  );
};

const fleetMission = account => {
  return axios.get(
    `https://api.nextcolony.io/loadfleetmission?user=${account}&active=1`,
  );
};

const loadFleet = (account, planetId) => {
  return axios.get(
    `https://api.nextcolony.io/loadfleet?user=${account}&planetid=${planetId}`,
  );
};

const fleetMissionOutgoing = (planetId, account) => {
  return axios.get(
    `https://api.nextcolony.io/loadfleetmission?planetid=${planetId}&user=${account}&active=1`,
  );
};

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
  if (availExplore) {
    availExplore = chkAvailExplorePoint(exceptPoint, targetPoint);
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
  explorePlanet,
) {
  // console.log(`Distance:${distance}`);

  let targetPoint = {};
  let availExplore = false;

  for (let i = 0; i < distance + 1; i++) {
    for (let j = 0; j < distance + 1; j++) {
      if (i + j != distance) continue;

      if (
        explorePlanet.explorerDirection.xminus &&
        explorePlanet.explorerDirection.yminus
      ) {
        targetPoint = { x: centerPointX - i, y: centerPointY - j };

        if(targetPoint.x >= exploreRange.fromX && targetPoint.x <= exploreRange.toX
          && targetPoint.y >= exploreRange.fromY && targetPoint.y <= exploreRange.toY){
            availExplore = searchTarget(targetPoint, explore, explored, planets);
        }
        
        if (availExplore) break;
      }

      if (
        explorePlanet.explorerDirection.xplus &&
        explorePlanet.explorerDirection.yminus
      ) {
        targetPoint = { x: centerPointX + i, y: centerPointY - j };
        if(targetPoint.x >= exploreRange.fromX && targetPoint.x <= exploreRange.toX
          && targetPoint.y >= exploreRange.fromY && targetPoint.y <= exploreRange.toY){
            availExplore = searchTarget(targetPoint, explore, explored, planets);
        }
        if (availExplore) break;
      }

      if (
        explorePlanet.explorerDirection.xplus &&
        explorePlanet.explorerDirection.yplus
      ) {
        targetPoint = { x: centerPointX + i, y: centerPointY + j };
        if(targetPoint.x >= exploreRange.fromX && targetPoint.x <= exploreRange.toX
          && targetPoint.y >= exploreRange.fromY && targetPoint.y <= exploreRange.toY){
            availExplore = searchTarget(targetPoint, explore, explored, planets);
        }
        if (availExplore) break;
      }

      if (
        explorePlanet.explorerDirection.xminus &&
        explorePlanet.explorerDirection.yplus
      ) {
        targetPoint = { x: centerPointX - i, y: centerPointY + j };
        if(targetPoint.x >= exploreRange.fromX && targetPoint.x <= exploreRange.toX
          && targetPoint.y >= exploreRange.fromY && targetPoint.y <= exploreRange.toY){
            availExplore = searchTarget(targetPoint, explore, explored, planets);
        }
        if (availExplore) break;
      }
    }
    if (availExplore) break;
  }

  if (availExplore) {
    return targetPoint;
  } else {
    return {};
  }
}

async function loadSchedulerJob(planet) {
  await axios
    .all([
      loadqyt(planet.id),
      loadproduction(planet.id, account),
      loadbuilding(planet.id),
      loadshipyard(planet.id),
      loadplanet(planet.id),
      loadGalaxy(planet.posx, planet.posy),
      loadskills(account),
      fleetMission(account),
      loadFleet(account, planet.id),
      fleetMissionOutgoing(planet.id, account),
    ]) // axios.all로 여러 개의 request를 보내고
    .then(
      await axios.spread(
        (
          qytInfoData,
          prodInfoData,
          buildingInfoData,
          shipyardInfoData,
          loadPlanetData,
          loadGalaxy,
          skillInfo,
          fleetMission,
          accountFleet,
          planetFleet,
        ) => {
          // response를 spread로 받는다
          // Build 관련 내용들
          console.log(`planet id:${planet.id}`);

          const qytInfo = qytInfoData.data;
          const prodInfo = prodInfoData.data;
          const buildingInfo = buildingInfoData.data;
          const shipyardInfo = shipyardInfoData.data;
          const loadPlanetInfo = loadPlanetData.data;
          const loadFleetInfo = fleetMission.data;

          let currDate = +new Date();
          let gap = currDate / 1000 - qytInfo.lastUpdate;

          let availCoal =
            qytInfo.coal + (gap * qytInfo.coalrate) / 24 / 60 / 60;
          let availCopper =
            qytInfo.copper + (gap * qytInfo.copperrate) / 24 / 60 / 60;
          let availOre = qytInfo.ore + (gap * qytInfo.orerate) / 24 / 60 / 60;
          let availUranium =
            qytInfo.uranium + (gap * qytInfo.uraniumrate) / 24 / 60 / 60;

          if (availCoal > qytInfo.coaldepot) availCoal = qytInfo.coaldepot;
          if (availCopper > qytInfo.copperdepot)
            availCopper = qytInfo.copperdepot;
          if (availOre > qytInfo.oredepot) availOre = qytInfo.oredepot;
          if (availUranium > qytInfo.uraniumdepot)
            availUranium = qytInfo.uraniumdepot;

          const mineArray = buildingInfo.filter(b => {
            return b.name.includes("mine");
          });

          const mineLevel = Math.min.apply(
            Math,
            mineArray.map(function(o) {
              return o.current;
            }),
          );

          buildingInfo.forEach(building => {
            if (maxBuildQty[building.name] < 1) return;
            if (maxBuildQty[building.name] <= building.current) return;

            if (availCoal < building.coal) return;
            if (availCopper < building.copper) return;
            if (availOre < building.ore) return;
            if (availUranium < building.uranium) return;

            if (currDate / 1000 <= building.busy) return;

            if (buildPlanetArray.indexOf(planet.id) > -1) return;
            if (
              building.name.indexOf("mine") < 0 &&
              mineLevel > -1 &&
              mineLevel < mineMinLevel &&
              mineLevel - building.current < mineGapVal
            )
              return;

            buildArray.push(
              `{"username":"${account}","type":"upgrade","command":{
                      "tr_var1":"${planet.id}",
                      "tr_var2":"${building.name}"}}`,
            );

            console.log(`Available building:${building.name}`);
          });

          // skill up
          // shipyardarray 리스트에 포함되어 있으면 스킬업은 하지 않는다.
          // if (!shipyardArray.some(s => s.id === planet.id)) {
          let targetPlanet = skillUpArray.filter(p => p.planet == planet.id);

          if (targetPlanet.length == 0) {
            targetPlanet = defaultSkillUpList;
          }

          if (targetPlanet.length) {
            const targetSkill = targetPlanet.filter(s => s.target);

            console.log(targetSkill);

            skillInfo.data.forEach(skill => {
              const targetInfo = targetSkill.filter(t => t.name == skill.name);

              if (!targetInfo.length) return;

              if (targetInfo[0].target <= skill.current) return;

              if (availCoal < skill.coal) return;
              if (availCopper < skill.copper) return;
              if (availOre < skill.ore) return;
              if (availUranium < skill.uranium) return;

              if (currDate / 1000 <= skill.busy) return;

              skillArray.push(
                `{"username":"${account}","type":"enhance","command":{
                          "tr_var1":"${account}",
                          "tr_var2":"${planet.id}",
                          "tr_var3":"${skill.name}"}}`,
              );

              console.log(`Available skill:${skill.name}`);
            });
          }
          // }

          // build ship
          // shipyardInfo
          const buildShipArray = shipyardArray.filter(s => s.id == planet.id);
          if (buildShipArray.length > 0) {
            const buildShip = buildShipArray[0];
            const buildArray = shipyardInfo.filter(s =>
              buildShip.ship.includes(s.type),
            );

            if (buildArray.length > 0) {
              // console.log(buildArray);

              buildArray.forEach(ship => {
                if (availCoal < ship.cost.coal) return;
                if (availCopper < ship.cost.copper) return;
                if (availOre < ship.cost.ore) return;
                if (availUranium < ship.cost.uranium) return;

                shipArray.push(
                  `{"username":"${account}","type":"buildship","command":{"tr_var1":"${planet.id}","tr_var2":"${ship.type}"}}`,
                );

                console.log(`Available ship:${ship.type}`);
              });
            }
          }

          // 탐사 관련
          //fleet 정보 보고, 행성들 마다 탐사선 운용 수량 조절, 방향조절

          const explorePlanet = explorePlanetArray.filter(e => {
            return e.id == planet.id;
          });

          // 탐사 행성 아니면 리턴
          if (explorePlanet.length) {
            const exploreMissions = loadFleetInfo.filter(
              l => l.type == "explorespace" && l.from_planet.id == planet.id,
            );

            // 행성당 제한한 횟수보다 많이 보낼 수 없음
            if (exploreMissions.length < explorePlanet[0].exploreCnt) {
              const data = loadGalaxy.data;
              const area = data.area;
              const explore = data.explore;
              const explored = data.explored;
              const planets = data.planets;

              const centerPointX = Math.floor((area.xmax + area.xmin) / 2);
              const centerPointY = Math.floor((area.ymax + area.ymin) / 2);

              let targetPoint = {};
              let availExplore = true;
              // 최대 120칸 거리까지 검색
              const startDistance = 240;
              const exploreshipType = "explorership1";
              for (let i = startDistance; i < 360; i++) {
                targetPoint = chkAvailExplorefromDistance(
                  centerPointX,
                  centerPointY,
                  i,
                  explore,
                  explored,
                  planets,
                  explorePlanet[0],
                );

                if (Object.keys(targetPoint).length) {
                  console.log(targetPoint);
                  break;
                }
              }

              if (availExplore) {
                searchGalaxyArray.push(
                  `{"username":"${account}","type":"explorespace","command":{"tr_var1":"${planet.id}","tr_var2":"${targetPoint.x}","tr_var3":"${targetPoint.y}","tr_var4":"${exploreshipType}"}}`,
                );
              } else {
                console.log("Can not find available explore point");
              }
            }
          }

          const attackCnt = loadFleetInfo.find(fleet => fleet.type == "attack");

          console.log(`attackcnt`, attackCnt);

          if (!attackCnt) {
            console.log(accountFleet);
            const shipCnt = accountFleet.data.filter(f => f.type == "corvette");
            const targetPlanetInfo = attackList[attackIdx];
            attackArray.push(
              `{"username":"${account}","type":"attack","command":{"tr_var1":{"corvette":{"pos":1,"n":${shipCnt.length}}},"tr_var2":${targetPlanetInfo.x},"tr_var3":${targetPlanetInfo.y},"tr_var4":"${planet.id}"}}`,
            );
            attackIdx++;
          }
        },
      ),
    )
    .catch(error => {
      console.error(error);
    });
}

function autoRun() {
  searchGalaxyArray = [];
  buildArray = [];
  skillArray = [];

  loadplanets(account)
    .then(response => {
      return response.data.planets;
    })
    .then(async planets => {
      for (let i = 0; i < planets.length; i++) {
        let planet = planets[i];
        await loadSchedulerJob(planet);
      }
    });
}

autoRun();

setInterval(autoRun, 4 * 60000);

setInterval(() => {
  if (buildArray.length == 0) return;

  let customJson = buildArray[0];
  buildArray.forEach(arr => {
    if (arr.indexOf("mine") > -1) {
      customJson = arr;
    }
  });

  console.log(`building:${customJson}`);

  const planetId = JSON.parse(customJson).command.tr_var1;

  buildArray = buildArray.filter(b => {
    return JSON.parse(b).command.tr_var1 != planetId;
  });

  steem.broadcast.customJson(
    postingkey, // posting key
    [],
    [account], // account
    "nextcolony", // 'nextcolony'
    customJson,
    function(err, result) {
      console.log(err, result);
    },
  );
}, 1 * 20 * 1000);

setInterval(() => {
  if (skillArray.length == 0) return;

  let customJson = skillArray[0];

  console.log(`skill:${customJson}`);

  const planetId = JSON.parse(customJson).command.tr_var2;

  skillArray = skillArray.filter(b => {
    return JSON.parse(b).command.tr_var2 != planetId;
  });

  steem.broadcast.customJson(
    postingkey, // posting key
    [],
    [account], // account
    "nextcolony", // 'nextcolony'
    customJson,
    function(err, result) {
      console.log(err, result);
    },
  );
}, 1 * 50 * 1000);

setInterval(() => {
  if (searchGalaxyArray.length == 0) return;

  const customJson = searchGalaxyArray.shift();
  console.log(customJson);
  steem.broadcast.customJson(
    postingkey, // posting key
    [],
    [account], // account
    "nextcolony", // 'nextcolony'
    customJson,
    function(err, result) {
      console.log(err, result);
    },
  );
}, 1 * 30 * 1000);

setInterval(() => {
  if (shipArray.length == 0) return;

  const customJson = shipArray.shift();
  console.log(customJson);
  steem.broadcast.customJson(
    postingkey, // posting key
    [],
    [account], // account
    "nextcolony", // 'nextcolony'
    customJson,
    function(err, result) {
      console.log(err, result);
    },
  );
}, 1 * 40 * 1000);

setInterval(() => {
  if (attackArray.length == 0) return;

  const customJson = attackArray.shift();
  console.log(customJson);
  steem.broadcast.customJson(
    postingkey, // posting key
    [],
    [account], // account
    "nextcolony", // 'nextcolony'
    customJson,
    function(err, result) {
      console.log(err, result);
    },
  );
}, 1 * 60 * 1000);
