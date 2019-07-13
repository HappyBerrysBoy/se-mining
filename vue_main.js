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
        prize: Math.floor(Math.random() * 100),
      });
    }

    // this.shuffle();
  },
  methods: {
    pressNum(num) {
      const account = $('#account').val();
      if (!confirm(`${account}님 ${num}번을 정말로 뽑으시겠습니까?`)) {
        return;
      }

      const self = this;

      const type = 'ppopki';
      const json = { id: 'test', num: num, permlink: 'test' };

      if (window.steem_keychain) {
        window.steem_keychain.requestCustomJson(
          account,
          type,
          'Active',
          JSON.stringify(json),
          `Pick ${num} up`,
          function(response) {
            console.log(response);
            alert(`Prize : ${self.numArray[num].prize} Steem`);
            self.numArray[num].styling = 'dead';
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
