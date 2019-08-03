const steem = require("steem");
const key = require("../key.json");

const planetArray = ["P-ZRBZG7PL6NK", "P-ZO75DZDVRUO"];
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
