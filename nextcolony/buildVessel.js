const steem = require("steem");
const key = require("../key.json");

//"P-ZRBZG7PL6NK" => D, "P-Z36VFV9RSR4" => C
const planetArray = ["P-ZD7VOJ4FF8W", "P-ZHGO5SVV8XC"];
const explorer = "explorership";

doBuild();

function doBuild() {
  setTimeout(async () => {
    if (planetArray.length == 0) return;

    const planet = planetArray.shift();
    await buildVessel(planet, explorer).then(r => console.log(r));
    doBuild();
  }, 30 * 1000);
}

function buildVessel(planetid, ship) {
  return new Promise(resolve => {
    steem.broadcast.customJson(
      key.happyberrysboy_posting, // posting key
      [],
      ["happyberrysboy"], // account
      "nextcolony", // 'nextcolony'
      `{"username":"happyberrysboy","type":"buildship","command":{"tr_var1":"${planetid}","tr_var2":"${ship}"}}`, // content json stringfy
      function(err, result) {
        resolve(result);
      }
    );
  });
}
