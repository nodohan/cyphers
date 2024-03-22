const commonUtil = require('../util/commonUtil');
const myConfig = require('../../config/config.js');

module.exports = (scheduler, maria, acclogger) => {
    const app = require('express').Router();
    app.use(acclogger());


    //스케쥴러 또는 웹 url call
    var time = "00 02 * * *"; // 리얼용
    //var time = "10 18 * * *"; // 테스트중
    // scheduler.scheduleJob(time, async function() {
    //     if (myConfig.schedulerRun) {
    //         logger.info("call match stats");
    //         await callInsertStats();
    //         logger.info("end match stats");
    //     }
    // });

    //test  ( "/statsSeasonSche/insertStats" )
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

    async function callInsertStats() {
        //SEASON
        await insertStats('2023-09-14', '2024-03-21', "2023U", "ATTACK", "DESC");
        await insertStats('2023-09-14', '2024-03-21', "2023U", "ATTACK", "ASC");
        await insertStats('2023-09-14', '2024-03-21', "2023U", "TANKER", "DESC");
        await insertStats('2023-09-14', '2024-03-21', "2023U", "TANKER", "ASC");
        await insertStats('2023-09-14', '2024-03-21', "2023U", "ALL", "DESC");
        await insertStats('2023-09-14', '2024-03-21', "2023U", "ALL", "ASC");
    }

    async function insertStats(startDate, endDate, statsType, combiType, order) {
        let combiTarget = combiType == "ATTACK" ? "attackerJoin" : "tankerJoin";        
        if (combiType == 'ALL') {
            combiTarget = 'allJoin';
        }

        let query =
            `   INSERT INTO match_stats  
                SELECT 
                    '${statsType}', 'A', '${combiType}' 
                    , '${startDate}', '${endDate}', '${order}' 
                    , combi, total, win, lose, CEILING( win / total * 100 ) AS late 
                FROM ( 
                    SELECT 
                        ${combiTarget} AS combi, COUNT(1) total
                        , COUNT(IF(matchResult = '승', 1, NULL)) win  
                        , COUNT(IF(matchResult = '패', 1, NULL)) lose 
                        , ROW_NUMBER() OVER(ORDER BY total DESC) AS total_rank
                    FROM matchdetail detail 
                    INNER JOIN (   
                        SELECT matchId FROM matches WHERE matchDate BETWEEN '${startDate}' AND '${endDate}' 
                    ) matches ON matches.matchId = detail.matchId 
                    GROUP BY ${combiTarget} 
                ) a   
                WHERE total_rank < 100
                ORDER BY late ${order} 
                limit 20`;

        logger.debug(query);

        pool = await maria.getPool();
        try {
            await pool.query(query);
        } catch (err) {
            logger.error(err);
            //throw err;
        }
    }

    async function insertCountSeasonChar() {
        let query = `
            INSERT INTO char_stats
            SELECT 
                '2023U' season, charName
                , total, win, lose
                , CEILING( win / total * 100 ) AS rate 
            FROM ( 
                SELECT 
                    charName
                    , COUNT(1) total
                    , COUNT(IF(matchResult = '승', 1, NULL)) win
                    , COUNT(IF(matchResult = '패', 1, NULL)) lose
                FROM matches_char 
                WHERE matchDate BETWEEN '2023-09-14' AND '2024-03-21'
                GROUP BY charName
            ) aa `;
    }

    return app;
}