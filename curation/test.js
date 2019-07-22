const steem = require('steem');
const config = require('../config.json');
const fs = require('fs');
const key = require('../key.json');

const discussionQuery = { tag: 'aaa', limit: '10' };

function getScotDataAsync(kind, query) {
  return new Promise((resolve, reject) => {
    if (kind === 'get_discussions_by_created') {
      try {
        steem.api.getDiscussionsByCreated(query, (err, result) => {
          if (err) {
            reject(new Error(`error:${err}`));
          }
          resolve(result);
        });
      } catch (e) {
        // reject(new Error(`error:${e}`));
        reject('test error');
      }
    }
  });
}

getScotDataAsync('get_discussions_by_created', discussionQuery)
  .then(feedData => {
    feedData.forEach(content => {
      const diffTime =
        (new Date().getTime() - new Date(content.created).getTime()) /
          (1000 * 60) -
        9 * 60;
      if (diffTime < 30 && diffTime >= 15) {
        console.log(`${content.authorperm} : ${diffTime}`);
        let isVoting = false;

        content.active_votes.forEach(voter => {
          if (voter.voter === 'realmankwon') {
            isVoting = true;
            return true;
          }
        });

        if (isVoting) {
          console.log('Already!');
        } else {
          console.log('Not yet!');
          steem.broadcast.vote(
            key.happyberrys_aaa_posting,
            'happyberrys.aaa',
            content.author,
            content.permlink,
            10000,
            function(err, result) {
              console.log(
                'Voted Succesfully, permalink: ' +
                  content.permlink +
                  ', author: ' +
                  content.author +
                  ', weight: ' +
                  100 +
                  '%.',
                err,
              );
            },
          );
        }
      }
    });
  })
  .catch(err => {
    console.log(err);
  });
