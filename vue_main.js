new Vue({
  el: '#app',
  data: {
    ssc: null,
    title: '추억의 뽑기',
    cntInRow: 13,
    lastNum: 168,
    numArray: [],
    currNum: 1,
    timer: null,
    interval: 0,
    divide: 100,
    currTime: 0,
  },
  computed: {},
  created() {
    this.ssc = new SSC('https://api.steem-engine.com/rpc/');
  },
  mounted() {
    for (let i = 0; i < this.lastNum; i++) {
      this.numArray.push({
        num: i + '',
        position: i,
        styling: 'alive',
      });
    }

    // this.shuffle();
  },
  methods: {
    pressNum(num) {
      this.numArray[num].styling = 'dead';

      if (window.steem_keychain) {
        const account = 'happyberrysboy';
        const planetid = 'P-ZA01QNQO29C';
        const buildname = 'researchcenter';
        const json = `{"username":"${account}","type":"upgrade","command":{"tr_var1":"${planetid}","tr_var2":"${buildname}"}}`;
        window.steem_keychain.requestCustomJson(
          'happyberrysboy',
          'nextcolony',
          'Posting',
          json,
          `Build ${buildname}`,
          function(response) {
            console.log(response);
          },
        );

        // Keychain Claim Token
        // const json_claim = JSON.stringify({ symbol: 'SPT' });
        // window.steem_keychain.requestCustomJson(
        //   'happyberrysboy',
        //   'scot_claim_token',
        //   'Posting',
        //   json_claim,
        //   'Claim ' + 'SPT',
        //   function(response) {
        //     console.log(response);
        //   },
        // );
      }
    },
    shuffle() {
      let currentIndex = this.numArray.length,
        temporaryValue,
        randomIndex;

      // While there remain elements to shuffle...
      while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = this.numArray[currentIndex];
        this.numArray[currentIndex] = this.numArray[randomIndex];
        this.numArray[randomIndex] = temporaryValue;
      }
    },
  },
});
