const commonUtil = require('../util/commonUtil');
const myConfig = require('../../config/config.js');

module.exports = (scheduler, maria, acclogger) => {
    const app = require('express').Router();
    app.use(acclogger());


    //스케쥴러 또는 웹 url call
    var time = "30 02 * * *"; // 리얼용
    //var time = "10 18 * * *"; // 테스트중
    scheduler.scheduleJob(time, async function() {
        if (myConfig.schedulerRun) {
            logger.info("call match stats");
            //await callInsertStats();
            logger.info("end match stats");
        }
    });

    //test  ( "/statsSche/insertStats" )
    app.get('/insertStats', function(req, res) {
        if (!commonUtil.isMe(req)) {
            return res.send({ "resultCode": "400", "resultMsg": "내가 아닌데??" });
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
        let totalCount = combiType == "ATTACK" ? 10 : 30;

        let query = ` INSERT INTO match_stats  
                        SELECT 
                            '${todayStr}', '${statsType}', '${combiType}' 
                            , '${startDateStr}', '${todayStr}', '${order}' 
                            , combi, total, win, lose, CEILING( win / total * 100 ) AS late 
                        FROM ( 
                            SELECT 
                                ${combiTarget} AS combi, COUNT(1) total
                                , COUNT(IF(matchResult = '승', 1, NULL)) win  
                                , COUNT(IF(matchResult = '패', 1, NULL)) lose 
                            FROM matchdetail detail 
                            INNER JOIN (   
                                SELECT matchId FROM matches 
                                WHERE matchDate BETWEEN '${startDateStr}' AND '${todayStr}' 
                            ) matches ON matches.matchId = detail.matchId 
                            GROUP BY ${combiTarget} 
                        ) a   
                        WHERE total >= ${totalCount} 
                        ORDER BY late ${order} 
                        LIMIT 10 `;

        logger.debug(query);

        
        try {
            await maria.doQuery(query);
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }


    return app;
}