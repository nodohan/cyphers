const commonUtil = require('../util/commonUtil');
const myConfig = require('../../config/config.js');

module.exports = (scheduler, maria) => {
    const app = require('express').Router();
    const api = require('../util/api');

    //스케쥴러 또는 웹 url call
    //var time = "40 23 * * *";
    var time = "00 01 * * *"; // 리얼용
    //var time = "10 18 * * *"; // 테스트중
    scheduler.scheduleJob(time, async function() {
        if (myConfig.schedulerRun) {
            logger.info("call match rating scheduler");
            await insertMatches('rating', null, new Date());
            logger.info("end match rating scheduler");

            // logger.info("call match rating scheduler");
            // await insertMatches('normal', null, new Date());
            // logger.info("end match rating scheduler");
        }
    });

    //test  ( "/matches/insertMatches?matchType=rating&date=2024-11-02" )
    app.get('/insertMatches', function(req, res) {
        if (!commonUtil.isMe(req)) {
            return res.send({ "resultCode": "400", "resultMsg": "내가 아닌데??" });
        }
        const matchType = req.query.matchType;
        return insertMatches(matchType, res, new Date(req.query.date));
    });

    async function insertMatches(matchType, res, day = new Date()) {
        let query;
        if (matchType == 'rating') {
            let searchDateStr = commonUtil.getYYYYMMDD(commonUtil.addDays(day, -1));
            query = `SELECT playerId FROM userRank where rankDate = '${searchDateStr}' `;
        } else {
            query = `SELECT playerId FROM player`;
        }
        logger.debug(query);

        let pool = await maria.getPool();
        try {
            let rows = await pool.query(query);
            let uniqMatchList = await getMatchListByAPI(matchType, rows, day);
            let result = await insertMatchId(matchType, uniqMatchList);
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

    async function getMatchListByAPI(matchType, rows, day = new Date()) {
        let yesterday = commonUtil.timestamp(commonUtil.setFromDay(commonUtil.addDays(day, -1)));
        let today = commonUtil.timestamp(commonUtil.setEndDay(commonUtil.addDays(day, -1)));

        logger.debug("search matchList yesterday = %s, today = %s, length= %d", yesterday, today, rows.length);

        //사용자 매칭 데이터 검색 
        let promiseItems = [];
        for (idx in rows) {
            let playerId = rows[idx].playerId;
            let time = idx * 30;
            let item = new Promise((resolve, reject) => {
                setTimeout(async() => {
                    resolve(await searchUserInfoCall(playerId, yesterday, today, matchType));
                }, time);
            });
            promiseItems.push(item);
        }

        //검색 결과 Merge 후 matchId insert 
        let resultItems = await Promise.all(promiseItems);
        let matches = [];
        for (idx in resultItems) {
            if (resultItems[idx] != null) {
                var rows = resultItems[idx].matches.rows.map(row => row.matchId);
                Array.prototype.push.apply(matches, rows);
            }
        }

        const uniqMatchList = [...new Set(matches)];
        for (idx in uniqMatchList) {
            logger.debug(uniqMatchList[idx]);
        }
        return uniqMatchList;
    }

    async function searchUserInfoCall(playerId, yesterday, today, matchType) {
        return new api().getUserInfoCall(playerId, matchType, yesterday, today);
    }

    async function insertMatchId(matchType, rows) {
        let pool = await maria.getPool();
        let tableName = matchType == 'rating' ? 'matches' : 'matches_normal';

        await pool.query("DELETE FROM matchId_temp");
        let query = `INSERT INTO matchId_temp (matchId, season) VALUES ( ?, '2024U' ) `;
        logger.debug(query);

        await pool.batch(query, rows.map(id => [id]), function(err) {
            console.log(err);
            logger.error(err);
            if (err) throw err;
        });

        let mergeQuery = `insert into ${tableName} (matchId, season) 
                          select matchId, season  
                          from matchId_temp 
                          where matchId not in ( 
                            select matchId from ${tableName} 
                          )`;

        logger.debug(mergeQuery);
        let result = await pool.query(mergeQuery);

        logger.debug("insert MatchId End ");

        return result;
    }

    return app;
}