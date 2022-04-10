const logger = require('../../config/winston');
const commonUtil = require('../util/commonUtil');
const myConfig = require('../../config/config.js');

module.exports = (scheduler, maria) => {
    const app = require('express').Router();
    const api = require('../../api');

    //스케쥴러 또는 웹 url call
    //var time = "40 23 * * *";
    var time = "00 01 * * *"; // 리얼용
    //var time = "10 18 * * *"; // 테스트중
    scheduler.scheduleJob(time, async function() {
        if (myConfig.schedulerRun) {
            logger.info("call match rating scheduler");
            await insertMatches('rating', null, new Date());
            logger.info("end match rating scheduler");

            logger.info("call match rating scheduler");
            await insertMatches('normal', null, new Date());
            logger.info("end match rating scheduler");
        }
    });

    //test  ( "/matches/insertMatches" )
    app.get('/insertMatches', function(req, res) {
        let allowIps = ["localhost", "127.0.0.1", "221.143.115.91", ":114.207.113.136", "::1", "::ffff:127.0.0.1", "34.64.4.116"];
        const ip = req.headers['x-forwarded-for'] || req.ip;
        let matchType = req.query.matchType;

        if (ip.indexOf(",") > 0) {
            ip = ip.toString().split(",")[1].trim();
        }

        logger.debug("call insertMatches ip", ip);
        if (!allowIps.includes(ip)) {
            return res
                .status(403)
                .send('Not allow IP :' + ip + ' \n')
                .end();
        }

        return insertMatches(matchType, res);
    });

    async function insertMatches(matchType, res, day = new Date()) {
        let query;
        if (matchType == 'rating') {
            let searchDateStr = commonUtil.getYYYYMMDD(commonUtil.addDays(day, -1));
            query = `SELECT playerId FROM rank where rankDate = '${searchDateStr}' `;
        } else {
            query = `SELECT playerId FROM player`;
        }
        console.log(query);

        let pool = await maria.getPool();
        try {
            let rows = await pool.query(query);
            let result = mergeMatchIds(matchType, rows, day);
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

    async function mergeMatchIds(matchType, rows, day = new Date()) {
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
        Promise.all(promiseItems).then(resultItems => {
            let matches = [];
            for (idx in resultItems) {
                if (resultItems[idx] != null) {
                    var rows = resultItems[idx].matches.rows.map(row => row.matchId);
                    Array.prototype.push.apply(matches, rows);
                }
            }
            const setMatch = new Set(matches);
            const uniqMatch = [...setMatch];
            return insertMatchId(matchType, uniqMatch);
        });
    }

    async function searchUserInfoCall(playerId, yesterday, today, matchType) {
        return new api().getUserInfoCall(playerId, matchType, yesterday, today);
    }

    async function insertMatchId(matchType, rows) {
        let result = 0;
        let pool = await maria.getPool();
        let tableName = matchType == 'rating' ? 'matches' : 'matches_normal';
        //logger.debug(rows);

        //batch를 promise에서 제공안하는것 같아, 
        //다중 insert를 하려고 하였으나, 오류났을때 데이터가 보존되지 않아 일차 포기
        rows.forEach(async function(matchId) {
            try {
                let query = `INSERT INTO ${tableName} (matchId, season) VALUES ( '${matchId}', '2022H' ); `;
                logger.debug(query);
                result += await pool.query(query);
            } catch (err) {
                logger.error(err);
            }
        });

        //다중 insert
        // let query = `INSERT INTO ${tableName} (matchId, season) VALUES ? `;
        // result = await pool.query(query, [rows], (err, res, meta) => {
        //     if (err) {
        //         logger.debug("Error loading data, reverting changes: ", err);
        //         return 0;
        //     } else {
        //         logger.debug(res);
        //         logger.debug(meta);
        //         return res.affectedRows;
        //     }
        // });

        return result;
    }

    return app;
}