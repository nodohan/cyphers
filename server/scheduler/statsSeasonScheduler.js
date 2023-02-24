const logger = require('../../config/winston');
const commonUtil = require('../util/commonUtil');
const myConfig = require('../../config/config.js');

module.exports = (scheduler, maria, acclogger) => {
    const app = require('express').Router();
    app.use(acclogger());


    //스케쥴러 또는 웹 url call
    var time = "00 02 * * *"; // 리얼용
    //var time = "10 18 * * *"; // 테스트중
    scheduler.scheduleJob(time, async function() {
        if (myConfig.schedulerRun) {
            logger.info("call match stats");
            await callInsertStats();
            logger.info("end match stats");
        }
    });

    //test  ( "/statsSeasonSche/insertStats" )
    app.get('/insertStats', function(req, res) {
        let allowIps = ["localhost", "127.0.0.1", "221.143.115.91", ":114.207.113.136", "::1", "::ffff:127.0.0.1", "34.64.4.116"];
        const ip = req.headers['x-forwarded-for'] || req.ip;

        if (ip.indexOf(",") > 0) {
            ip = ip.toString().split(",")[1].trim();
        }

        logger.debug("call insertStats ip", ip);
        if (!allowIps.includes(ip)) {
            return res
                .status(403)
                .send('Not allow IP :' + ip + ' \n')
                .end();
        }

        try {
            callInsertStats(res)
        } catch (err) {
            res.send(err);
        }

        return res
            .status(200)
            .send(true)
            .end();
    });

    function callInsertStats() {
        //SEASON
        insertStats('2022-02-21', '2022-08-18', "2022H", "ATTACK", "DESC");
        insertStats('2022-02-21', '2022-08-18', "2022H", "ATTACK", "ASC");
        insertStats('2022-02-21', '2022-08-18', "2022H", "TANKER", "DESC");
        insertStats('2022-02-21', '2022-08-18', "2022H", "TANKER", "ASC");
        insertStats('2022-02-21', '2022-08-18', "2022H", "ALL", "DESC");
        insertStats('2022-02-21', '2022-08-18', "2022H", "ALL", "ASC");
    }

    async function insertStats(startDate, endDate, statsType, combiType, order) {
        let combiTarget = combiType == "ATTACK" ? "attackerJoin" : "tankerJoin";
        let totalCount = combiType == "ATTACK" ? 150 : 300;
        if (combiType == 'ALL') {
            combiTarget = 'allJoin';
            totalCount = 7;
        }

        let query =
            `   INSERT INTO match_stats  
                SELECT 
                    '${statsType}', 'A', '${combiType}' 
                    , '${startDate}', '${endDate}', '${order}' 
                    , combi, total, win, lose, CEILING( win / total * 100 ) AS late 
                FROM ( 
                    SELECT 
                        ${combiTarget} AS combi, COUNT(1) total, COUNT(IF(matchResult = '승', 1, NULL)) win  
                        , COUNT(IF(matchResult = '패', 1, NULL)) lose 
                        , GROUP_CONCAT(detail.matchId) matchIds 
                    FROM matchdetail detail 
                    INNER JOIN (   
                        SELECT matchId FROM matches WHERE matchDate BETWEEN '${startDate}' AND '${endDate}' 
                    ) matches ON matches.matchId = detail.matchId 
                    GROUP BY ${combiTarget} 
                ) a   
                WHERE total >= ${totalCount} 
                ORDER BY late ${order} 
                LIMIT 20 `;

        logger.debug(query);

        pool = await maria.getPool();
        try {
            await pool.query(query);
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }


    return app;
}