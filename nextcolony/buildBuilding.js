const axios = require("axios");
const steem = require("steem");
const key = require("../key.json");

const account = "happyberrysboy";
const mineMinLevel = 13;
const mineGapVal = 7;
const shipyardArray = [
  { name: "N", id: "P-Z03P0EIL1LS", ship: ["explorership"] },
  { name: "O", id: "P-Z11IOTOZ9WG", ship: ["explorership"] },
  { name: "P", id: "P-Z44ED8BDCZ4", ship: ["explorership"] },
  { name: "Q", id: "P-ZH2DUQGU1Z4", ship: ["explorership"] },
  { name: "R", id: "P-Z7K08XK4IFK", ship: ["explorership"] },
  { name: "U", id: "P-Z4878F8CXG0", ship: ["explorership"] }
  // { name: "S", id: "P-ZNBD5M6HLN4", ship: ["explorership"] },
  // { name: "T", id: "P-Z0QS8KUS8ZK", ship: ["explorership"] },
];

// shield 켜는 custom_json 나중에 참고!!
// {"username":"happyberrysboy","type":"enable","command":{"tr_var1":"P-ZA01QNQO29C","tr_var2":"shieldgenerator"}}

// 리스트에 포함되면 업글 안함
const buildPlanetArray = ["P-ZA01QNQO29C"];

//탐험 관련 계정
const explorePlanetArray = [
  {
    name: "N",
    id: "P-Z03P0EIL1LS",
    exploreCnt: 4,
    explorerDirection: {
      xminus: false,
      xplus: true,
      yminus: true,
      yplus: true
    }
  },
  {
    name: "R",
    id: "P-Z7K08XK4IFK",
    exploreCnt: 4,
    explorerDirection: {
      xminus: false,
      xplus: true,
      yminus: true,
      yplus: true
    }
  },
  {
    name: "V",
    id: "P-Z3LJ6NVV1O0",
    exploreCnt: 4,
    explorerDirection: {
      xminus: true,
      xplus: true,
      yminus: true,
      yplus: false
    }
  },
  {
    name: "W",
    id: "P-ZRI66JULGW0",
    exploreCnt: 6,
    explorerDirection: {
      xminus: false,
      xplus: true,
      yminus: true,
      yplus: true
    }
  },
  {
    name: "X",
    id: "P-Z1YNSURVXKG",
    exploreCnt: 14,
    explorerDirection: {
      xminus: true,
      xplus: true,
      yminus: true,
      yplus: true
    }
  }
];

const defaultSkillUpList = [
  { name: "Transporter", target: 20 },
  { name: "Frigate", target: 20 },
  { name: "missioncontrol", target: 0 },
  { name: "uraniumbooster", target: 10 },
  { name: "copperbooster", target: 0 },
  { name: "coalbooster", target: 5 },
  { name: "orebooster", target: 10 },
  { name: "uraniummine", target: 16 },
  { name: "coppermine", target: 16 },
  { name: "oremine", target: 17 },
  { name: "coalmine", target: 18 },
  { name: "shipyard", target: 20 },
  { name: "researchcenter", target: 13 },
  { name: "armorimprove", target: 20 },
  { name: "structureimprove", target: 20 },
  { name: "armorimprove", target: 20 },
  { name: "shieldimprove", target: 20 },
  { name: "rocketimprove", target: 20 },
  { name: "bulletimprove", target: 20 },
  { name: "laserimprove", target: 20 },
  { name: "siegeprolongation", target: 10 }
];

const skillUpArray = [
  {
    name: "A",
    planet: "P-ZA01QNQO29C",
    skill: [{ name: "missioncontrol", target: 20 }]
  }
];

let buildArray = [];
let searchGalaxyArray = [];
let skillArray = [];
let shipArray = [];

const exceptPoint = [{ x: -10, y: -170 }];
const maxBuildQty = {
  base: -1,
  shipyard: 14,
  researchcenter: -1,
  coalmine: 14,
  oremine: 15,
  coppermine: 13,
  uraniummine: 15,
  coaldepot: 10,
  oredepot: 10,
  copperdepot: 10,
  uraniumdepot: 10,
  bunker: -1,
  shieldgenerator: -1
};
const buildPriority = {
  explorer: 0,
  base: -1,
  shipyard: 14,
  researchcenter: -1,
  coalmine: 15,
  oremine: 15,
  coppermine: 14,
  uraniummine: 16,
  coaldepot: 13,
  oredepot: 13,
  copperdepot: 13,
  uraniumdepot: 13,
  bunker: -1,
  shieldgenerator: -1
};

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
    `https://api.nextcolony.io/loadproduction?id=${planetId}&user=${account}`
  );
};

const loadGalaxy = (planetX, planetY) => {
  return axios.get(
    `https://api.nextcolony.io/loadgalaxy?x=${planetX}&y=${planetY}&height=120&width=120`
  );
};

const fleetMission = account => {
  return axios.get(
    `https://api.nextcolony.io/loadfleetmission?user=${account}&active=1`
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
  explorePlanet
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
        availExplore = searchTarget(targetPoint, explore, explored, planets);
        if (availExplore) break;
      }

      if (
        explorePlanet.explorerDirection.xplus &&
        explorePlanet.explorerDirection.yminus
      ) {
        targetPoint = { x: centerPointX + i, y: centerPointY - j };
        availExplore = searchTarget(targetPoint, explore, explored, planets);
        if (availExplore) break;
      }

      if (
        explorePlanet.explorerDirection.xplus &&
        explorePlanet.explorerDirection.yplus
      ) {
        targetPoint = { x: centerPointX + i, y: centerPointY + j };
        availExplore = searchTarget(targetPoint, explore, explored, planets);
        if (availExplore) break;
      }

      if (
        explorePlanet.explorerDirection.xminus &&
        explorePlanet.explorerDirection.yplus
      ) {
        targetPoint = { x: centerPointX - i, y: centerPointY + j };
        availExplore = searchTarget(targetPoint, explore, explored, planets);
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
      fleetMission(account)
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
          fleetMission
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
            })
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
                      "tr_var2":"${building.name}"}}`
            );

            console.log(`Available building:${building.name}`);
          });

          // skill up
          // shipyardarray 리스트에 포함되어 있으면 스킬업은 하지 않는다.
          if (!shipyardArray.some(s => s.id === planet.id)) {
            let targetPlanet = skillUpArray.filter(p => p.planet == planet.id);

            if (targetPlanet.length == 0) {
              targetPlanet = defaultSkillUpList;
            }

            if (targetPlanet.length) {
              const targetSkill = targetPlanet.filter(s => s.target);

              // console.log(targetSkill);

              skillInfo.data.forEach(skill => {
                const targetInfo = targetSkill.filter(
                  t => t.name == skill.name
                );

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
                          "tr_var3":"${skill.name}"}}`
                );

                console.log(`Available skill:${skill.name}`);
              });
            }
          }

          // build ship
          // shipyardInfo
          const buildShipArray = shipyardArray.filter(s => s.id == planet.id);
          if (buildShipArray.length > 0) {
            const buildShip = buildShipArray[0];
            const buildArray = shipyardInfo.filter(s =>
              buildShip.ship.includes(s.type)
            );

            if (buildArray.length > 0) {
              // console.log(buildArray);

              buildArray.forEach(ship => {
                if (availCoal < ship.cost.coal) return;
                if (availCopper < ship.cost.copper) return;
                if (availOre < ship.cost.ore) return;
                if (availUranium < ship.cost.uranium) return;

                shipArray.push(
                  `{"username":"${account}","type":"buildship","command":{"tr_var1":"${planet.id}","tr_var2":"${ship.type}"}}`
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
          if (!explorePlanet.length) return;

          const exploreMissions = loadFleetInfo.filter(
            l => l.type == "explorespace" && l.from_planet.id == planet.id
          );

          // 행성당 제한한 횟수보다 많이 보낼 수 없음
          if (exploreMissions.length >= explorePlanet[0].exploreCnt) return;

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
          for (let i = 1; i < 120; i++) {
            targetPoint = chkAvailExplorefromDistance(
              centerPointX,
              centerPointY,
              i,
              explore,
              explored,
              planets,
              explorePlanet[0]
            );

            if (Object.keys(targetPoint).length) {
              console.log(targetPoint);
              break;
            }
          }

          if (availExplore) {
            searchGalaxyArray.push(
              `{"username":"${account}","type":"explorespace","command":{"tr_var1":"${planet.id}","tr_var2":"${targetPoint.x}","tr_var3":"${targetPoint.y}","tr_var4":"explorership"}}`
            );
          } else {
            console.log("Can not find available explore point");
          }
        }
      )
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
    key.happyberrysboy_posting, // posting key
    [],
    [account], // account
    "nextcolony", // 'nextcolony'
    customJson,
    function(err, result) {
      console.log(err, result);
    }
  );
}, 1 * 40 * 1000);

setInterval(() => {
  if (skillArray.length == 0) return;

  let customJson = skillArray[0];

  console.log(`skill:${customJson}`);

  const planetId = JSON.parse(customJson).command.tr_var2;

  skillArray = skillArray.filter(b => {
    return JSON.parse(b).command.tr_var2 != planetId;
  });

  steem.broadcast.customJson(
    key.happyberrysboy_posting, // posting key
    [],
    [account], // account
    "nextcolony", // 'nextcolony'
    customJson,
    function(err, result) {
      console.log(err, result);
    }
  );
}, 3 * 60 * 1000);

setInterval(() => {
  if (searchGalaxyArray.length == 0) return;

  const customJson = searchGalaxyArray.shift();
  console.log(customJson);
  steem.broadcast.customJson(
    key.happyberrysboy_posting, // posting key
    [],
    [account], // account
    "nextcolony", // 'nextcolony'
    customJson,
    function(err, result) {
      console.log(err, result);
    }
  );
}, 1 * 70 * 1000);

setInterval(() => {
  if (shipArray.length == 0) return;

  const customJson = shipArray.shift();
  console.log(customJson);
  steem.broadcast.customJson(
    key.happyberrysboy_posting, // posting key
    [],
    [account], // account
    "nextcolony", // 'nextcolony'
    customJson,
    function(err, result) {
      console.log(err, result);
    }
  );
}, 3 * 60 * 1000);
