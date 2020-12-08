var blurt = require("@blurtfoundation/blurtjs");

blurt.api.getAccounts(["megadrive", "jacobgadikian"], function (err, result) {
  console.log(err, result);
});
