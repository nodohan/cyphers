const request = require('request-promise-native');
const myConfig = require('../../config/config.js');

class api {
    constructor() {
        this.newSeasonStartDay = "2022-02-17 11:00";
        this.newSeasonDay = new Date(this.newSeasonStartDay);

        this.seasonStartDay = "2021-07-15 12:00"; //이번시즌 시작일 
        //this.seasonStartDay = '2021-08-05 10:00'; // 인틈 삭제일
        this.apiKey = myConfig.apiKey;

        this.nickOpt = {
            uri: "https://api.neople.co.kr/cy/players",
            qs: { nickname: '', wordType: 'match', limit: 3, apikey: this.apiKey }
        };

        this.matchOpt = {
            uri: "https://api.neople.co.kr/cy/matches/",
            qs: { apikey: this.apiKey }
        };
    }

    async call(opt) {
        return await request(opt, function(error, response, body) {
            //console.log('statusCode:', response && response.statusCode);
            if (response.statusCode == 404) {
                console.log("404 error : " + opt);
            }
            return body;
        });
    };

    async getUserInfoCall(userId, gameType, startDate, endDate) {
        var matchInfo = {
            url: "https://api.neople.co.kr/cy/players/#playerId#/matches",
            qs: { apikey: this.apiKey, gameTypeId: gameType, limit: 100, startDate: startDate, endDate: endDate }
        };
        matchInfo.url = matchInfo.url.replace("#playerId#", userId);
        return await this.getMatchInfo(matchInfo, null);
    };

    async getMatchInfo(matchInfo, mergeData) {
        try {
            var result = await this.call(matchInfo);
            //logger.debug("뭐받음", result);
            var resultJson = JSON.parse(result);
            mergeData = mergeJson(mergeData, resultJson);
            let next = resultJson.matches.next;
            if (next != null) {
                //logger.debug("NEXT가 있어요 ", next);
                matchInfo.qs.next = next;
                await this.getMatchInfo(matchInfo, mergeData);
            }

            return mergeData;
        } catch (err) {
            return null;
        }
    };

    async getPlayerIdByName(nickname) {
        nickOpt.qs.nickname = nickname;
        return await this.call(nickOpt).then(async(result) => {
            let json = JSON.parse(result);
            if (json.rows == null || json.rows.length == 0) {
                return null;
            }
            return json.rows[0].playerId;
        });
    }

    async searchUser(nickname, gameType) {
        this.nickOpt.qs.nickname = nickname;

        let today = new Date();
        if (today >= this.newSeasonDay) {
            this.seasonStartDay = this.newSeasonStartDay;
        }

        return await this.call(this.nickOpt).then(async(result) => {
            logger.debug("사용자 %s", result);
            let json = JSON.parse(result);

            if (json.rows == null || json.rows.length == 0) {
                return { 'resultCode': -1 };
            }

            let userId = json.rows[0].playerId;

            var result = null;
            let diffDay = dateDiff(this.seasonStartDay, new Date());
            let startDate = this.seasonStartDay;
            let endDate = getMinDay(addDays(startDate, 90), new Date());

            while (diffDay >= 0) {
                result = mergeJson(result, await this.getUserInfoCall(userId, gameType, startDate, endDate));
                startDate = endDate;
                endDate = getMinDay(addDays(startDate, 90), new Date());
                diffDay = diffDay - 90;
            }
            return result;
        });
    };

    async searchMatchInfo(matchId) {
        this.matchOpt.uri += matchId;

        return await this.call(this.matchOpt).then(async(result) => {
            return JSON.parse(result);
        });
    };
}

function mergeJson(mergeData, resultJson) {
    if (mergeData == null) {
        mergeData = resultJson;
    } else if (resultJson != null) {
        mergeData.matches.rows = mergeData.matches.rows.concat(resultJson.matches.rows);
    }

    return mergeData;
}

// 두개의 날짜를 비교하여 차이를 알려준다.
function dateDiff(_date1, _date2) {
    var diffDate_1 = _date1 instanceof Date ? _date1 : new Date(_date1);
    var diffDate_2 = _date2 instanceof Date ? _date2 : new Date(_date2);

    diffDate_1 = new Date(diffDate_1.getFullYear(), diffDate_1.getMonth() + 1, diffDate_1.getDate());
    diffDate_2 = new Date(diffDate_2.getFullYear(), diffDate_2.getMonth() + 1, diffDate_2.getDate());

    var diff = Math.abs(diffDate_2.getTime() - diffDate_1.getTime());
    diff = Math.ceil(diff / (1000 * 3600 * 24));

    return diff;
}

function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function getMinDay(date1, date2) {
    return date1.getTime() < date2.getTime() ? date1 : date2;
}


module.exports = api;