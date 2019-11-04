const axios = require("axios");
const steem = require("steem");
const key = require("../key.json");

const account = "happyberrysboy";
const type = "deploy";
const postingkey = key.happyberrysboy_posting;
const shipList = { transportship: 10, corvette: 2, frigate: 98, destroyer: 0 };
const coal = 0;
const ore = 0;
const copper = 0;
const uranium = 50;
const planetName = "R";
let departPlanet = "P-Z5TV3Z99YM8";
const destinationX = 69;
const destinationY = -79;

// {"username":"happyberrysboy","type":"deploy","command":{"tr_var1":{"transportship":1,"frigate":51,"destroyer":3,"corvette":3},"tr_var2":69,"tr_var3":-79,"tr_var4":0,"tr_var5":0,"tr_var6":0,"tr_var7":50,"tr_var8":"P-ZRBZG7PL6NK"}}

const loadplanets = account => {
  return axios.get(`https://api.nextcolony.io/loadplanets?user=${account}`);
};

// const customJson = `{"username":"${account}","type":"${type}",
//   "command":{"tr_var1":${JSON.stringify(
//     shipList,
//   )},"tr_var2":${destinationX},"tr_var3":${destinationY},"tr_var4":${coal},"tr_var5":${ore},"tr_var6":${copper},"tr_var7":${uranium},"tr_var8":"${departPlanet}"}}`;

run();

function run() {
  loadplanets(account).then(async r => {
    const planet = r.data.planets.filter(p => p.name == planetName);

    if (!planet) return;

    departPlanet = planet[0].id;

    const customJson = `{"username":"${account}","type":"${type}",
        "command":{"tr_var1":${JSON.stringify(
          shipList,
        )},"tr_var2":${destinationX},"tr_var3":${destinationY},"tr_var4":${coal},"tr_var5":${ore},"tr_var6":${copper},"tr_var7":${uranium},"tr_var8":"${departPlanet}"}}`;

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
  });
}
