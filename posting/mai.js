const steem = require("steem");
const fs = require("fs");
const key = require("../key.json");

const date = new Date();
date.setHours(date.getHours() + 9); // 9시간 추가
const preYear = date.getFullYear() + "";
const preMonth = (date.getMonth() + 1 + "").padStart(2, "0");
const preDay = (date.getDate() + "").padStart(2, "0");
const preDateString = `${preYear}-${preMonth}-${preDay}`;

date.setDate(date.getDate() + 1);
const year = date.getFullYear() + "";
const month = (date.getMonth() + 1 + "").padStart(2, "0");
const day = (date.getDate() + "").padStart(2, "0");
const dateString = `${year}-${month}-${day}`;

const title = `[${year}/${month}/${day}] KR 커뮤니티 출석부`;
const account = "maikuraki";
const basePermlink = "3wz6r8";

let g_cmtMap = new Map();
let g_linkSet = new Set();
let content = "";

function getFormat() {
  return new Promise((resolve, reject) => {
    steem.api.getContent(account, basePermlink, function(err, result) {
      if (err) {
        console.log(err);
        return;
      }

      console.log(result);

      const body = result.body;
      resolve(body);
    });
  });
}

function noLink(body) {
  idxhttp = body.indexOf("https://");

  if (idxhttp < 0) {
    return "";
  }

  endIdx = body.indexOf("\n", idxhttp);
  if (endIdx < 0) {
    endIdx = body.indexOf(" ", idxhttp);
  }
  if (endIdx < 0) {
    return body.substring(idxhttp);
  }
  return body.substring(idxhttp, endIdx);
}

function getPrePosting(id, permlink) {
  return new Promise(async (resolve, reject) => {
    await steem.api.getContentReplies(id, permlink, async function(
      err,
      result,
    ) {
      if (err != null) {
        return;
      }

      for (let i = 0; i < result.length; ++i) {
        let cmt = result[i];

        if (cmt.author.length <= 0 || cmt.author == null || cmt.author == "") {
          continue;
        }

        g_cmtMap.set(cmt.author, cmt.body);
        link = "";
        console.log("--" + cmt.json_metadata + "--");
        if (
          cmt.json_metadata == undefined ||
          cmt.json_metadata == null ||
          cmt.json_metadata == ""
        ) {
          link = noLink(cmt.body);
        } else {
          let jm = JSON.parse(cmt.json_metadata);

          if (jm.links != undefined && jm.links.length > 0) {
            link = jm.links[0];
          } else {
            link = noLink(cmt.body);
          }
        }

        if (link == "") {
          continue;
        }

        index = link.lastIndexOf("/");
        pl = link.substring(index + 1);

        await getPost(cmt.author, pl).then(txt => (content += txt));
      }

      resolve(content);
    });
  });
}

function getPost(author, permlink) {
  return new Promise(resolve => {
    steem.api.getContent(author, permlink, function(err, result) {
      if (result.root_title == "") {
        resolve("");
      }

      g_linkSet.add(result.author);

      posttitle = result.root_title.replace(/|/g, "");

      txt = genText(author, posttitle, result.url);
      resolve(txt);
    });
  });
}

function genText(author, title, url) {
  txt = "";
  txt += "| @";
  txt += author;
  txt += " | [";
  txt += title;
  txt += "](";
  txt += "https://steemit.com";
  txt += url;
  txt += ") |";
  txt += "\n";
  return txt;
}

Promise.all([getFormat(), getPrePosting(account, `${preDateString}-kr`)]).then(
  ([format, prePosting]) => {
    console.log(format);
    console.log(prePosting);

    steem.broadcast.comment(
      key.mai_posting,
      "",
      "sct",
      account,
      `${dateString}-kr`,
      title,
      format.replace(/{{content}}/g, prePosting),
      {
        tags: [
          "sct",
          "sct-kr",
          "sct-freeboard",
          "busy",
          "jjm",
          "dblog",
          "liv",
          "zzan",
          "palnet",
          "iv",
          "sportstalk",
          "sago",
        ],
        community: "busy",
        app: "steemcoinpan/0.1",
        format: "markdown",
      },
      function(err, result) {
        console.log(err, result);
      },
    );
  },
);
