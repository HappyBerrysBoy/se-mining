const axios = require("axios");

const bus20 = "71039";

checkBus(bus20);

async function checkBus(busno) {
  axios
    .get(
      `https://map.naver.com/v5/api/bus/location?lang=ko&routeId=${busno}&caller=pc_map&dummy=1595371183300`
    )
    .then((r) => {
      console.log(r);
    })
    .catch((err) => {
      console.log(err);
    });
}
