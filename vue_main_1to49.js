new Vue({
  el: '#app',
  data: {
    title: '1 to 49',
    cntInRow:7,
    lastNum: 49,
    numArray: [],
    currNum: 1,
    timer: null,
    interval: 0,
    divide: 100,
    currTime: 0,
  },
  computed: {},
  created() {},
  mounted() {
    for (let i = 0; i < this.lastNum; i++) {
      this.numArray.push({
        num: i + 1 + '',
        position: i,
        styling: 'alive',
      });
    }

    this.shuffle();
  },
  methods: {
    start() {
      this.timer = setInterval(this.increment, 1000 / this.divide);
    },
    increment() {
      this.interval++;
      this.currTime = this.interval / this.divide;
    },
    stop() {
      clearInterval(this.timer);
      this.timer = null;
    },
    reset() {
      this.stop();
      this.interval = 0;
      this.currTime = this.interval / this.divide;
    },
    pressNum(num) {
      if (num != this.currNum) return;

      let selBtn = this.numArray.filter(btn => {
        return btn.num == this.currNum;
      });

      selBtn[0].styling = 'dead';

      if (this.currNum == 1) {
        this.start();
      } else if (this.currNum == this.lastNum) {
        this.stop();
        alert('Congratulations!!');
      }

      this.currNum += 1;
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
