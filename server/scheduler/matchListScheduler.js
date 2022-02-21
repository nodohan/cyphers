const logger = require('../../config/winston');
const commonUtil = require('../util/commonUtil');

module.exports = (scheduler, maria) => {
    const app = require('express').Router();
    const api = require('../../api');

    const isRun = false;
    const isDebug = true;

    //스케쥴러 또는 웹 url call
    //var time = "40 23 * * *";
    var time = "00 01 * * *"; // 리얼용
    //var time = "10 18 * * *"; // 테스트중
    scheduler.scheduleJob(time, async function() {
        if (isRun) {
            logger.info("call match scheduler");
            await insertMatches(null, new Date());
            logger.info("end match scheduler");
        }
    });

    //test  ( "/matches/insertMatches" )
    app.get('/insertMatches', function(req, res) {
        let allowIps = ["localhost", "127.0.0.1", "221.143.115.91", ":114.207.113.136", "::1", "::ffff:127.0.0.1", "34.64.4.116"];
        const ip = req.headers['x-forwarded-for'] || req.ip;

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

        return insertMatches(res);
    });

    async function insertMatches(res, day = new Date()) {
        let searchDateStr = commonUtil.getYYYYMMDD(commonUtil.addDays(day, -1));
        let query = `SELECT playerId FROM rank where rankDate = '${searchDateStr}'; `;
        logger.debug(query);

        let pool = await maria.getPool();
        try {
            let rows = await pool.query(query);
            let result = mergeMatchIds(rows, day);
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

    async function mergeMatchIds(rows, day = new Date()) {

        let yesterday = commonUtil.timestamp(commonUtil.setFromDay(commonUtil.addDays(day, -1)));
        let today = commonUtil.timestamp(commonUtil.setEndDay(commonUtil.addDays(day, -1)));

        logger.debug("search matchList yesterday = %s, today = %s", yesterday, today);

        //사용자 매칭 데이터 검색 
        let promiseItems = [];
        for (idx in rows) {
            let playerId = rows[idx].playerId;
            //logger.debug("search user matchList username= %s", playerId);

            let time = idx * 50;
            let item = new Promise((resolve, reject) => {
                setTimeout(async() => {
                    resolve(await searchUserInfoCall(playerId, yesterday, today));
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
            return insertMatchId(uniqMatch);
        });
    }

    async function searchUserInfoCall(playerId, yesterday, today) {
        logger.debug("search UserInfo Call %s", playerId);
        return new api().getUserInfoCall(playerId, "rating", yesterday, today);
    }

    async function insertMatchId(rows) {
        let result = 0;
        let pool = await maria.getPool();

        rows.forEach(async function(matchId) {
            try {
                logger.debug(matchId);
                let query = `INSERT INTO matches (matchId, season) VALUES ( '${matchId}', '2022H' ); `;
                result += await pool.query(query);
            } catch (err) {
                logger.error(err);
            }
        });

        return result;
    }

    function printQuery(query) {
        if (isDebug) {
            logger.debug(query);
        }
    }


    return app;
}