const repository = require('../repository/MatchRepository.js');
const commonUtil = require('../util/commonUtil');
const api = require('../util/api');

class MatchService {

    constructor() {
        this.matchRepository = new repository();
    }
    
    insertMatches = async (matchType, res, startDay, endDay)  => {        
        try {
            let playerIds = await this.matchRepository.findRankUserList(matchType, startDay);        
            let uniqMatchList = await this.getMatchListByAPI(matchType, playerIds, startDay, endDay);
            let result = await this.matchRepository.insertMatchId(matchType, uniqMatchList);
            if (res) {
                res.send(result > 0); // rows 를 보내주자
            }
        } catch (err) {
            logger.error(err);
            if (res) {
                return res
                    .status(500)
                    .send('오류 발생')
                    .end();
            }
        }
    }

    getMatchListByAPI= async (matchType, rows, startDay, endDay) => {
        let yesterday = commonUtil.timestamp(commonUtil.setFromDay(commonUtil.addDays(startDay, -1)));
        let today = commonUtil.timestamp(commonUtil.setEndDay(commonUtil.addDays(endDay, -1)));

        logger.debug("search matchList yesterday = %s, today = %s, length= %d", yesterday, today, rows.length);

        //사용자 매칭 데이터 검색 
        let promiseItems = [];
        for (let idx in rows) {
            let playerId = rows[idx].playerId;
            let time = idx * 30;
            let item = new Promise((resolve, reject) => {
                setTimeout(async() => {
                    resolve(await this.searchUserInfoCall(playerId, yesterday, today, matchType));
                }, time);
            });
            promiseItems.push(item);
        }

        //검색 결과 Merge 후 matchId insert 
        let resultItems = await Promise.all(promiseItems);
        let matches = [];
        for (let idx in resultItems) {
            if (resultItems[idx] != null) {
                const matchIds = resultItems[idx].matches.rows.map(r => r.matchId);
                matches.push(...matchIds);
            }
        }

        const uniqMatchList = [...new Set(matches)];
        for (let idx in uniqMatchList) {
            logger.debug(uniqMatchList[idx]);
        }
        return uniqMatchList;
    }

    searchUserInfoCall = async (playerId, yesterday, today, matchType) => {
        return new api().getUserInfoCall(playerId, matchType, yesterday, today);
    }

}

module.exports = MatchService;
