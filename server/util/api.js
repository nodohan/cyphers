//const fetch = require("node-fetch");
const axios = require("axios");
const qs = require('qs');
const myConfig = require("../../config/config.js");
const commonUtil = require("./commonUtil");

class api {
  constructor() {

    this.seasonStartDay = "2025-04-10 12:00"; //이번시즌 시작일
    this.apiKey = myConfig.apiKey;

    this.nickOpt = {
      uri: "https://api.neople.co.kr/cy/players",
      qs: { nickname: "", wordType: "match", limit: 3, apikey: this.apiKey },
    };

    this.matchOpt = {
      uri: "https://api.neople.co.kr/cy/matches/",
      qs: { apikey: this.apiKey },
    };
  }

  async call(opt) {
    try {
      const url = (opt.uri || opt.url);
      //logger.debug("url: %s", url);
      const response = await axios.get(url, { params: opt.qs} );

      if (response.status != 200) {
        logger.error("%d error : %s", response.statusCode, JSON.stringify(opt));
        return null;
      }

      return await response.data;
    } catch (error) {
      console.error("Error: %s", JSON.stringify(opt), error);
    }
  }

  async getUserInfoCall(userId, gameType, startDate, endDate) {
    logger.info("userId: %s, start: %s, end: %s", userId, startDate, endDate)

    let urlInfo = "https://api.neople.co.kr/cy/players/#playerId#/matches?apikey=#apiKey#&gameTypeId=#gameTypeId#&limit=100&startDate=#startDate#&endDate=#endDate#";
    urlInfo = urlInfo.replace("#playerId#", userId)
                     .replace("#apiKey#", myConfig.apiKey)
                     .replace("#gameTypeId#", gameType)
                     .replace("#startDate#", startDate)
                     .replace("#endDate#", endDate);

    var matchInfo = {
      url: urlInfo,
      qs: {},
      playerId: userId,
    };

    return await this.getMatchInfo(matchInfo, null);
  }

  async getMatchInfo(matchInfo, mergeData) {
    try {
      var resultJson = await this.call(matchInfo);
      //logger.debug("resultJson: %s" , resultJson.matches);
      mergeData = mergeJson(mergeData, resultJson);
      let next = resultJson.matches.next;
      if (next != null && matchInfo.qs.next != next ) {
        matchInfo.qs.next = next;
        await this.getMatchInfo(matchInfo, mergeData);
      }

      return mergeData;
    } catch (err) {
      return null;
    }
  }

  async getPlayerIdByName(nickname) {
    this.nickOpt.qs.nickname = nickname;
    const json = await this.call(this.nickOpt);
    console.log(json);
    if (json == null || json.rows == null || json.rows.length == 0) {
      return null;
    }
    return json.rows[0].playerId;
  }

  async searchUser(nickname, gameType) {
    this.nickOpt.qs.nickname = nickname;
    let json = await this.call(this.nickOpt);
  
    logger.debug("사용자 %s", JSON.stringify(json));

    if (json == null || json.rows == null || json.rows.length == 0) {
      return { resultCode: -1 };
    }

    let userId = json.rows[0].playerId;

    var result = null;
    let diffDay = dateDiff(this.seasonStartDay, new Date());
    let startDate = new Date(this.seasonStartDay);
    let endDate = getMinDay(addDays(startDate, 90), new Date());

    while (diffDay >= 0) {
      result = mergeJson(
        result,
        await this.getUserInfoCall(
          userId,
          gameType,
          commonUtil.timestamp(startDate),
          commonUtil.timestamp(endDate)
        )
      );
      
      startDate = endDate;
      endDate = getMinDay(addDays(startDate, 90), new Date());
      diffDay = diffDay - 90;
      logger.debug("diff:" , diffDay);
    }
    return result;
  }

  userInfoSimple = async (playerId) => {
    let reqParam = { ...this.nickOpt};
    reqParam.uri = reqParam.uri + "/"+ playerId;  
    let json = await this.call(reqParam);
    
    if (json == null) {
      return { resultCode: -1 };
    }
    return {  resultCode : 200, row : json };
  }

  async searchMatchInfo(matchId) {
    this.matchOpt.uri += matchId;
    return await this.call(this.matchOpt);
  }
}

function mergeJson(mergeData, resultJson) {
  try {
    if (mergeData == null) {
        mergeData = resultJson;
      } else if (resultJson != null) {
        mergeData.matches.rows = mergeData.matches.rows.concat(
          resultJson.matches.rows
        );
      }

      let rows = mergeData.matches.rows;
      rows = rows.filter((obj, index, self) =>
        index === self.findIndex((t) => t.matchId === obj.matchId)
      ); 
      mergeData.matches.rows = rows;
  } catch(err) {
    console.log(err);
  }
  
  return mergeData;
}

// 두개의 날짜를 비교하여 차이를 알려준다.
function dateDiff(_date1, _date2) {
  var diffDate_1 = _date1 instanceof Date ? _date1 : new Date(_date1);
  var diffDate_2 = _date2 instanceof Date ? _date2 : new Date(_date2);

  diffDate_1 = new Date(
    diffDate_1.getFullYear(),
    diffDate_1.getMonth() + 1,
    diffDate_1.getDate()
  );
  diffDate_2 = new Date(
    diffDate_2.getFullYear(),
    diffDate_2.getMonth() + 1,
    diffDate_2.getDate()
  );

  var diff = Math.abs(diffDate_2.getTime() - diffDate_1.getTime());
  diff = Math.ceil(diff / (1000 * 3600 * 24));

  return diff;
}

function addDays(date, days) {
  var result = new Date(date.getTime());
  result.setDate(result.getDate() + days);
  return result;
}

function getMinDay(date1, date2) {
  return date1.getTime() < date2.getTime() ? date1 : date2;
}

module.exports = api;
