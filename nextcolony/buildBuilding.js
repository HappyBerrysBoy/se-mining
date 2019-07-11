const axios = require('axios');
const steem = require('steem');
const key = require('../key.json');

const account = 'happyberrysboy';
// const buildPlanetArray = ['P-ZO75DZDVRUO'];
let buildArray = [];
let searchGalaxyArray = [];
// const planetId = "P-ZA01QNQO29C";
const maxBuildQty = {
  base: -1,
  shipyard: 14,
  researchcenter: -1,
  coalmine: 13,
  oremine: 13,
  coppermine: 13,
  uraniummine: 15,
  coaldepot: 13,
  oredepot: 13,
  copperdepot: 13,
  uraniumdepot: 13,
  bunker: 13,
  shieldgenerator: -1,
};
const buildPriority = [
  { explorer: 0 },
  { base: -1 },
  { shipyard: 14 },
  { researchcenter: -1 },
  { coalmine: 13 },
  { oremine: 13 },
  { coppermine: 13 },
  { uraniummine: 13 },
  { coaldepot: 13 },
  { oredepot: 13 },
  { copperdepot: 13 },
  { uraniumdepot: 13 },
  { bunker: -1 },
  { shieldgenerator: -1 },
];

// Planet 정보
const loadplanets = account => {
  return axios.get(`https://nextcolony.io/api/loadplanets?user=${account}`);
};

const loadskills = account => {
  return axios.get(`https://nextcolony.io/api/loadskills?user=${account}`);
};

const loadplanet = planetId => {
  return axios.get(`https://nextcolony.io/api/loadplanet?id=${planetId}`);
};

const loadqyt = planetId => {
  return axios.get(`https://nextcolony.io/api/loadqyt?id=${planetId}`);
};

const loadbuilding = planetId => {
  return axios.get(`https://nextcolony.io/api/loadbuildings?id=${planetId}`);
};

const loadshipyard = planetId => {
  return axios.get(`https://nextcolony.io/api/shipyard?id=${planetId}`);
};

const loadproduction = (planetId, account) => {
  return axios.get(
    `https://nextcolony.io/api/loadproduction?id=${planetId}&user=${account}`,
  );
};

const loadGalaxy = (planetX, planetY) => {
  return axios.get(
    `https://nextcolony.io/api/loadgalaxy?x=${planetX}&y=${planetY}&height=120&width=120`,
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

function autoRun() {
  searchGalaxyArray = [];
  buildArray = [];

  loadplanets(account)
    .then(response => {
      return response.data.planets;
    })
    .then(planets => {
      planets.forEach(planet => {
        // if (buildPlanetArray.indexOf(planet.id) < 0) return;

        axios
          .all([
            loadqyt(planet.id),
            loadproduction(planet.id, account),
            loadbuilding(planet.id),
            loadshipyard(planet.id),
            loadplanet(planet.id),
            loadGalaxy(planet.posx, planet.posy),
          ]) // axios.all로 여러 개의 request를 보내고
          .then(
            axios.spread(
              (
                qytInfoData,
                prodInfoData,
                buildingInfoData,
                shipyardInfoData,
                loadPlanetData,
                loadGalaxy,
              ) => {
                // response를 spread로 받는다
                // Build 관련 내용들
                console.log(`planet id:${planet.id}`);

                const qytInfo = qytInfoData.data;
                const prodInfo = prodInfoData.data;
                const buildingInfo = buildingInfoData.data;
                const shipyardInfo = shipyardInfoData.data;
                const loadPlanetInfo = loadPlanetData.data;

                let currDate = +new Date();
                let gap = currDate / 1000 - qytInfo.lastUpdate;

                let availCoal =
                  qytInfo.coal + (gap * qytInfo.coalrate) / 24 / 60 / 60;
                let availCopper =
                  qytInfo.copper + (gap * qytInfo.copperrate) / 24 / 60 / 60;
                let availOre =
                  qytInfo.ore + (gap * qytInfo.orerate) / 24 / 60 / 60;
                let availUranium =
                  qytInfo.uranium + (gap * qytInfo.uraniumrate) / 24 / 60 / 60;

                if (availCoal > qytInfo.coaldepot)
                  availCoal = qytInfo.coaldepot;
                if (availCopper > qytInfo.copperdepot)
                  availCopper = qytInfo.copperdepot;
                if (availOre > qytInfo.oredepot) availOre = qytInfo.oredepot;
                if (availUranium > qytInfo.uraniumdepot)
                  availUranium = qytInfo.uraniumdepot;

                buildingInfo.forEach(building => {
                  if (maxBuildQty[building.name] < 1) return;
                  if (maxBuildQty[building.name] <= building.current) return;

                  if (availCoal < building.coal) return;
                  if (availCopper < building.copper) return;
                  if (availOre < building.ore) return;
                  if (availUranium < building.uranium) return;

                  if (currDate / 1000 <= building.busy) return;

                  buildArray.push(
                    `{"username":"${account}","type":"upgrade","command":{"tr_var1":"${
                      planet.id
                    }","tr_var2":"${building.name}"}}`,
                  );

                  console.log(`Available building:${building.name}`);
                });

                // console.log(buildArray);

                //planet = {"img":"co_atm_1.png","level_base":3,"level_coal":12,"level_coaldepot":12,"level_copper":12,"level_copperdepot":12,"level_ore":12,"level_oredepot":12,"level_research":3,"level_ship":14,"level_uranium":15,"level_uraniumdepot":12,"planet_bonus":0.0,"planet_corx":-3,"planet_cory":-182,"planet_crts":1555928508,"planet_id":"P-ZA01QNQO29C","planet_name":"Alpha","planet_rarity":"common","planet_type":"earth","shieldcharge_busy":0,"shieldcharged":0,"shieldprotection_busy":0,"startplanet":1,"total_type":4016,"user":"happyberrysboy"}
                //qytInfo = coal, coaldepot, coalrate, copper, copperdepot......
                //prodInfo = coal:{booster:null, depot:2880, level:12, production:960, safe:0}, copper....
                //buildingInfo = [{base:0, busy:1559091080, coal:1344, copper:288, cur_rate:null, current:14, misc:null, name:"shipyard", next_rate:null, ore:576, research:0, skill:14, time:46560, uranium:156}, ....]
                //shipyardInfo = [{"activated":false,"armor":20,"bullet":0,"busy_until":null,"capacity":160,"class":"Battlecruiser","consumption":0.0038,"cost":{"coal":576,"copper":144,"ore":288,"time":101323.48,"uranium":72},"cur_level":14,"cur_level_skill":14,"laser":0,"longname":"Battlecruiser Tiger","min_level":18,"rocket":8,"shield":36,"skill":null,"speed":2.0,"structure":40,"type":"battlecruiser","variant":0,"variant_name":"rocket"},{"activated":false,"armor":20,"bullet":8,"busy_until":null,"capacity":160,"class":"Battlecruiser","consumption":0.0038,"cost":{"coal":576,"copper":144,"ore":288,"time":101323.48,"uranium":72},"cur_level":14,"cur_level_skill":14,"laser":0,"longname":"Battlecruiser Lion","min_level":18,"rocket":0,"shield":36,"skill":null,"speed":2.0,"structure":40,"type":"battlecruiser1","variant":1,"variant_name":"bullet"},{"activated":false,"armor":100,"bullet":0,"busy_until":null,"capacity":800,"class":"Carrier","consumption":0.0096,"cost":{"coal":1520,"copper":380,"ore":760,"time":164159.38,"uranium":190},"cur_level":14,"cur_level_skill":14,"laser":0,"longname":"Carrier Argus","min_level":19,"rocket":20,"shield":80,"skill":null,"speed":1.0,"structure":60,"type":"carrier","variant":0,"variant_name":"rocket"},{"activated":false,"armor":100,"bullet":20,"busy_until":null,"capacity":800,"class":"Carrier","consumption":0.0096,"cost":{"coal":1520,"copper":380,"ore":760,"time":164159.38,"uranium":190},"cur_level":14,"cur_level_skill":14,"laser":0,"longname":"Carrier Unicorn","min_level":19,"rocket":0,"shield":80,"skill":null,"speed":1.0,"structure":60,"type":"carrier1","variant":1,"variant_name":"bullet"},{"activated":false,"armor":8,"bullet":0,"busy_until":null,"capacity":20,"class":"Corvette","consumption":0.001,"cost":{"coal":112,"copper":28,"ore":56,"time":32919.08,"uranium":17},"cur_level":14,"cur_level_skill":14,"laser":0,"longname":"Corvette Crocus","min_level":14,"rocket":2,"shield":10,"skill":1,"speed":4.0,"structure":6,"type":"corvette","variant":0,"variant_name":"rocket"},{"activated":false,"armor":8,"bullet":2,"busy_until":null,"capacity":20,"class":"Corvette","consumption":0.001,"cost":{"coal":112,"copper":28,"ore":56,"time":32919.08,"uranium":17},"cur_level":14,"cur_level_skill":14,"laser":0,"longname":"Corvette Petunia","min_level":14,"rocket":0,"shield":10,"skill":1,"speed":4.0,"structure":6,"type":"corvette1","variant":1,"variant_name":"bullet"},{"activated":false,"armor":25,"bullet":0,"busy_until":null,"capacity":100,"class":"Cruiser","consumption":0.0024,"cost":{"coal":340,"copper":85,"ore":170,"time":70963.76,"uranium":42},"cur_level":14,"cur_level_skill":14,"laser":0,"longname":"Cruiser Kent","min_level":17,"rocket":5,"shield":20,"skill":null,"speed":2.0,"structure":15,"type":"cruiser","variant":0,"variant_name":"rocket"},{"activated":false,"armor":25,"bullet":5,"busy_until":null,"capacity":100,"class":"Cruiser","consumption":0.0024,"cost":{"coal":340,"copper":85,"ore":170,"time":70963.76,"uranium":42},"cur_level":14,"cur_level_skill":14,"laser":0,"longname":"Cruiser Drake","min_level":17,"rocket":0,"shield":20,"skill":null,"speed":2.0,"structure":15,"type":"cruiser1","variant":1,"variant_name":"bullet"},{"activated":false,"armor":14,"bullet":0,"busy_until":null,"capacity":50,"class":"Destroyer","consumption":0.0018,"cost":{"coal":240,"copper":60,"ore":120,"time":53074.04,"uranium":30},"cur_level":14,"cur_level_skill":14,"laser":0,"longname":"Destroyer Rocket","min_level":16,"rocket":4,"shield":16,"skill":null,"speed":3.0,"structure":12,"type":"destroyer","variant":0,"variant_name":"rocket"},{"activated":false,"armor":14,"bullet":4,"busy_until":null,"capacity":50,"class":"Destroyer","consumption":0.0018,"cost":{"coal":240,"copper":60,"ore":120,"time":53074.04,"uranium":30},"cur_level":14,"cur_level_skill":14,"laser":0,"longname":"Destroyer Janus","min_level":16,"rocket":0,"shield":16,"skill":null,"speed":3.0,"structure":12,"type":"destroyer1","variant":1,"variant_name":"bullet"},{"activated":false,"armor":240,"bullet":0,"busy_until":null,"capacity":2000,"class":"Dreadnought","consumption":0.024,"cost":{"coal":4000,"copper":1000,"ore":2000,"time":371520.0,"uranium":500},"cur_level":14,"cur_level_skill":14,"laser":0,"longname":"Dreadnought Royal","min_level":20,"rocket":50,"shield":160,"skill":null,"speed":1.0,"structure":200,"type":"dreadnought","variant":0,"variant_name":"rocket"},{"activated":false,"armor":240,"bullet":50,"busy_until":null,"capacity":2000,"class":"Dreadnought","consumption":0.024,"cost":{"coal":4000,"copper":1000,"ore":2000,"time":371520.0,"uranium":500},"cur_level":14,"cur_level_skill":14,"laser":0,"longname":"Dreadnought Imperial","min_level":20,"rocket":0,"shield":160,"skill":null,"speed":1.0,"structure":200,"type":"dreadnought1","variant":1,"variant_name":"bullet"},{"activated":false,"armor":20,"bullet":0,"busy_until":1562039690,"capacity":0,"class":"Explorer","consumption":0.002,"cost":{"coal":520,"copper":65,"ore":250,"time":26684.079999999998,"uranium":91},"cur_level":14,"cur_level_skill":14,"laser":0,"longname":"Explorer","min_level":13,"rocket":0,"shield":20,"skill":20,"speed":1.0,"structure":80,"type":"explorership","variant":0,"variant_name":"civil"},{"activated":false,"armor":16,"bullet":0,"busy_until":null,"capacity":40,"class":"Frigate","consumption":0.0014,"cost":{"coal":180,"copper":45,"ore":90,"time":41280.0,"uranium":22},"cur_level":14,"cur_level_skill":14,"laser":0,"longname":"Frigate Quorn","min_level":15,"rocket":3,"shield":8,"skill":null,"speed":3.0,"structure":12,"type":"frigate","variant":0,"variant_name":"rocket"},{"activated":false,"armor":16,"bullet":3,"busy_until":null,"capacity":40,"class":"Frigate","consumption":0.0014,"cost":{"coal":180,"copper":45,"ore":90,"time":41280.0,"uranium":22},"cur_level":14,"cur_level_skill":14,"laser":0,"longname":"Frigate Redmill","min_level":15,"rocket":0,"shield":8,"skill":null,"speed":3.0,"structure":12,"type":"frigate1","variant":1,"variant_name":"bullet"},{"activated":false,"armor":20,"bullet":0,"busy_until":null,"capacity":100,"class":"Transporter","consumption":0.002,"cost":{"coal":538,"copper":96,"ore":276,"time":21854.32,"uranium":62},"cur_level":14,"cur_level_skill":14,"laser":0,"longname":"Transporter","min_level":12,"rocket":0,"shield":20,"skill":6,"speed":2.0,"structure":80,"type":"transportship","variant":0,"variant_name":"civil"}]
                //skillInfo = [{"busy":1558984189,"coal":1344,"copper":288,"current":14,"name":"shipyard","ore":576,"time":48000,"uranium":156},{"busy":1557335921,"coal":499,"copper":94,"current":12,"name":"oredepot","ore":150,"time":31028,"uranium":52},{"busy":1559481986,"coal":416,"copper":62,"current":12,"name":"copperdepot","ore":225,"time":31028,"uranium":62},{"busy":1559620097,"coal":403,"copper":202,"current":13,"name":"coaldepot","ore":403,"time":38278,"uranium":76},{"busy":1559620199,"coal":605,"copper":242,"current":13,"name":"uraniumdepot","ore":336,"time":38278,"uranium":50},{"busy":1558823360,"coal":0,"copper":0,"current":20,"name":"Explorer","ore":0,"time":0,"uranium":0},{"busy":1557850913,"coal":538,"copper":96,"current":6,"name":"Transporter","ore":276,"time":25412,"uranium":62},{"busy":1556966731,"coal":84,"copper":50,"current":1,"name":"Corvette","ore":118,"time":38278,"uranium":17},{"busy":0,"coal":120,"copper":18,"current":0,"name":"Frigate","ore":48,"time":48000,"uranium":21},{"busy":0,"coal":128,"copper":19,"current":0,"name":"Destroyer","ore":51,"time":61714,"uranium":22},{"busy":0,"coal":136,"copper":17,"current":0,"name":"Cruiser","ore":54,"time":82517,"uranium":29},{"busy":0,"coal":173,"copper":50,"current":0,"name":"Battlecruiser","ore":101,"time":117818,"uranium":22},{"busy":0,"coal":182,"copper":53,"current":0,"name":"Carrier","ore":106,"time":190884,"uranium":23},{"busy":0,"coal":160,"copper":20,"current":0,"name":"Dreadnought","ore":64,"time":432000,"uranium":34},{"busy":1556538905,"coal":582,"copper":83,"current":12,"name":"oremine","ore":125,"time":31028,"uranium":52},{"busy":1556577416,"coal":416,"copper":52,"current":12,"name":"coppermine","ore":200,"time":31028,"uranium":73},{"busy":1556555639,"coal":208,"copper":104,"current":12,"name":"coalmine","ore":349,"time":31028,"uranium":42},{"busy":1557927246,"coal":1024,"copper":538,"current":15,"name":"uraniummine","ore":640,"time":61714,"uranium":80},{"busy":1556715088,"coal":42,"copper":10,"current":6,"name":"base","ore":20,"time":9480,"uranium":4},{"busy":1556713415,"coal":29,"copper":7,"current":5,"name":"researchcenter","ore":12,"time":7579,"uranium":4},{"busy":0,"coal":240,"copper":60,"current":0,"name":"orebooster","ore":120,"time":432000,"uranium":29},{"busy":0,"coal":192,"copper":56,"current":0,"name":"coalbooster","ore":112,"time":432000,"uranium":24},{"busy":0,"coal":80,"copper":40,"current":0,"name":"copperbooster","ore":112,"time":432000,"uranium":19},{"busy":1558705164,"coal":1120,"copper":200,"current":4,"name":"uraniumbooster","ore":480,"time":432000,"uranium":156},{"busy":1562246130,"coal":2880,"copper":720,"current":4,"name":"missioncontrol","ore":1440,"time":432000,"uranium":346},{"busy":1557827801,"coal":12,"copper":2,"current":2,"name":"bunker","ore":6,"time":3153,"uranium":1},{"busy":1557568293,"coal":32,"copper":8,"current":1,"name":"enlargebunker","ore":16,"time":1991,"uranium":5},{"busy":0,"coal":1536,"copper":499,"current":0,"name":"structureimprove","ore":640,"time":61714,"uranium":160},{"busy":0,"coal":1280,"copper":499,"current":0,"name":"armorimprove","ore":768,"time":61714,"uranium":160},{"busy":0,"coal":1280,"copper":461,"current":0,"name":"shieldimprove","ore":640,"time":61714,"uranium":192},{"busy":0,"coal":1536,"copper":499,"current":0,"name":"rocketimprove","ore":640,"time":61714,"uranium":160},{"busy":0,"coal":1280,"copper":499,"current":0,"name":"bulletimprove","ore":768,"time":61714,"uranium":160},{"busy":0,"coal":1280,"copper":461,"current":0,"name":"laserimprove","ore":640,"time":61714,"uranium":192},{"busy":0,"coal":179,"copper":31,"current":0,"name":"regenerationbonus","ore":32,"time":61714,"uranium":16},{"busy":0,"coal":128,"copper":46,"current":0,"name":"repairbonus","ore":77,"time":61714,"uranium":16},{"busy":0,"coal":8,"copper":2,"current":0,"name":"shieldgenerator","ore":4,"time":945,"uranium":1},{"busy":0,"coal":728,"copper":182,"current":0,"name":"siegeprolongation","ore":364,"time":31028,"uranium":153}]

                // 탐사 관련 얘기들..
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
                  );

                  if (Object.keys(targetPoint).length) {
                    console.log(targetPoint);
                    break;
                  }
                }

                if (availExplore) {
                  searchGalaxyArray.push(
                    `{"username":"${account}","type":"explorespace","command":{"tr_var1":"${
                      planet.id
                    }","tr_var2":"${targetPoint.x}","tr_var3":"${
                      targetPoint.y
                    }","tr_var4":"explorership"}}`,
                  );
                } else {
                  console.log('Can not find available explore point');
                }
              },
            ),
          )
          .catch(error => {
            console.error(error);
          });
      });
    });
}

autoRun();

setTimeout(autoRun, 9 * 60000);

setTimeout(() => {
  if (buildArray.length == 0) return;

  const customJson = buildArray[0];
  steem.broadcast.customJson(
    key.happyberrysboy_posting, // posting key
    [],
    [account], // account
    'nextcolony', // 'nextcolony'
    customJson,
    function(err, result) {
      console.log(err, result);
    },
  );
}, 5 * 60 * 1000);

setTimeout(() => {
  if (searchGalaxyArray.length == 0) return;

  const customJson = searchGalaxyArray[0];
  console.log(customJson);
  steem.broadcast.customJson(
    key.happyberrysboy_posting, // posting key
    [],
    [account], // account
    'nextcolony', // 'nextcolony'
    customJson,
    function(err, result) {
      console.log(err, result);
    },
  );
}, 5 * 60 * 1000);
