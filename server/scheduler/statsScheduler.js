const logger = require('../../config/winston');
const commonUtil = require('../util/commonUtil');

module.exports = (scheduler, maria, acclogger) => {
    const app = require('express').Router();
    app.use(acclogger());

    const isRun = false;
    const isDebug = true;

    //스케쥴러 또는 웹 url call
    var time = "00 02 * * *"; // 리얼용
    //var time = "10 18 * * *"; // 테스트중
    scheduler.scheduleJob(time, async function() {
        if (isRun) {
            logger.info("call match stats");
            await callInsertStats();
            logger.info("end match stats");
        }
    });

    //test  ( "/statsSche/insertStats" )
    app.get('/insertStats', function(req, res) {
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
        //주간 
        insertStats(new Date(), "W", "ATTACK", "DESC");
        insertStats(new Date(), "W", "ATTACK", "ASC");
        insertStats(new Date(), "W", "TANKER", "DESC");
        insertStats(new Date(), "W", "TANKER", "ASC");

        //월간
        insertStats(new Date(), "M", "ATTACK", "DESC");
        insertStats(new Date(), "M", "ATTACK", "ASC");
        insertStats(new Date(), "M", "TANKER", "DESC");
        insertStats(new Date(), "M", "TANKER", "ASC");
    }

    async function insertStats(statsDate, statsType, combiType, order) {
        let todayStr = commonUtil.getYYYYMMDD(statsDate, false);
        let startDateStr = commonUtil.getYYYYMMDD(commonUtil.addDays(statsDate, statsType == "W" ? -7 : -30), false);
        let combiTarget = combiType == "ATTACK" ? "attackerJoin" : "tankerJoin";
        let totalCount = combiType == "ATTACK" ? 20 : 30;

        let query = " INSERT INTO match_stats  \n";
        query += " SELECT '" + todayStr + "', '" + statsType + "', '" + combiType + "' \n ";
        query += " , '" + startDateStr +"', '" + todayStr +"', '" + order +"' \n ";
        query += "       , combi, total, win, lose, CEILING( win / total * 100 ) AS late \n";
        query += " FROM ( \n";
        query += " 	SELECT \n";
        query += " 		" + combiTarget + " AS combi, COUNT(1) total, COUNT(IF(matchResult = '승', 1, NULL)) win  \n";
        query += " 		, COUNT(IF(matchResult = '패', 1, NULL)) lose \n";
        query += " 		, GROUP_CONCAT(detail.matchId) matchIds \n";
        query += " 	FROM matchdetail detail \n";
        query += " 	INNER JOIN (   \n";
        query += " 		SELECT matchId FROM matches WHERE matchDate BETWEEN '" + startDateStr + "' AND '" + todayStr + "' \n";
        query += " 	) matches ON matches.matchId = detail.matchId \n";
        query += " 	GROUP BY " + combiTarget + " \n";
        query += " ) a   \n";
        query += " WHERE total >= " + totalCount + " \n";
        query += " ORDER BY late " + order + " \n";
        query += " LIMIT 10 \n";

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