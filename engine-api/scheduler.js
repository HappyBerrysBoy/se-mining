const cron = require('node-cron');
const scotAPI = require('./scotPoolAPI');

const account = 'scotpool.miner';
const SCT = 'SCT';
const SCTM = 'SCTM';

/**
 * pending claim 체크
 */
cron.schedule('5 * * * *', async function() {
  const d = new Date();
  console.log('pendingclaim Start', d);

  let r = await scotAPI.checkPendingClaim(account, SCT);

  if (r > 0) {
    // claimrewards
    let key = require('../key.json');
    await scotAPI.claimRewards(key.post, account, SCT);

    console.log('claim rewards ', r);
  }
  console.log('pendingclaim End', d);
});

/**
 * transfer to sctm
 */
cron.schedule('10,20,30 * * * *', async function() {
  // get token balances
  const bal = await scotAPI.getTokenBalances(account, SCT);

  if (bal > 0) {
    const balMod = Math.floor(bal);

    if (balMod % 2 == 1) balMod -= 1;

    // 시간당 6SCT 채굴 될 것이므로..
    if (balMod > 5) {
      // transfer to sctm, convert sctm
      const key = require('../key.json');
      await scotAPI.transferToken(
        key.active,
        account,
        SCT,
        'sctm',
        balMod + '',
        '',
      );

      console.log('>> transfer ', balMod);
    }
  }
});

/**
 * sctm token 개수 확인 후 stake
 */
cron.schedule('15,25,35 * * * *', async function() {
  // get token balances
  const bal = await scotAPI.getTokenBalances(account, SCTM);
  console.log('check stake tokens', bal);

  const balMod = Math.floor(bal);

  if (balMod > 1) {
    const key = require('../key.json');
    await scotAPI.stakeToken(key.active, account, SCTM, balMod + '');

    console.log('stake token balances', balMod);
  }
});
