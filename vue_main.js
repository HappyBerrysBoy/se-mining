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

      const json_claim = JSON.stringify({ symbol: 'ZZAN' });

      if (window.steem_keychain) {
        window.steem_keychain.requestCustomJson(
          'happyberrysboy',
          'scot_claim_token',
          'Posting',
          json_claim,
          'Claim ' + 'SPT',
          function(response) {
            debugger;
            console.log(response);
          },
        );
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
