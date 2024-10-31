const commonUtil = require('../util/commonUtil');
const myConfig = require('../../config/config.js');

module.exports = (scheduler, maria) => {
    const app = require('express').Router();
    const api = require('../util/api');

    //스케쥴러 또는 웹 url call
    //var time = "40 23 * * *";
    var time = "00 02 * * *"; // 리얼용
    //var time = "10 18 * * *"; // 테스트중
    scheduler.scheduleJob(time, async function() {
        if (myConfig.schedulerRun) {
            logger.info("call match map scheduler");
            await selectMatches('rating', null, new Date());
            logger.info("end match map scheduler");
        }
    });

    //test  ( "/matchesMap/insertMatchesMap" )
    app.get('/insertMatchesMap', function(req, res) {
        if (!commonUtil.isMe(req)) {
            return res.send({ "resultCode": "400", "resultMsg": "내가 아닌데??" });
        }
        return selectMatches(res, '2024-09-25');
    });

    async function selectMatches(res, day = new Date()) {
        //let searchDateStr = commonUtil.getYYYYMMDD(commonUtil.addDays(day, -1));
        const query = `
            SELECT ma.matchId, jsonData 
            FROM matches ma 
            LEFT JOIN matches_map map ON map.matchId = ma.matchId 
            WHERE matchDate >= '${day}'
            AND map.matchId IS NULL limit 1000 `;
       
        logger.debug(query);

        let pool = await maria.getPool();
        try {
            let rows = await pool.query(query);
            let matchMap = extractPlayerId(rows);
            let result = await insertMatchId(matchMap);
            if (res) {
                res.send(result > 0); // rows 를 보내주자
            }
        } catch (err) {
            console.log("에러1",err);
            logger.error(err);
        }
    }

    function extractPlayerId(rows) {
        logger.debug("extract players");

        //사용자 매칭 데이터 검색 
        let items = [];
        rows.forEach(row => {
            const matchId = row.matchId;
            JSON.parse(row.jsonData).players.forEach(row2 => {
                items.push([matchId, row2.playerId]);
            });
        });

        return items;
    }

    async function insertMatchId(rows) {
        let pool = await maria.getPool();        
        let query = `INSERT INTO matches_map (matchId, playerId) VALUES ( ?, ? ) `;
        logger.debug(query);

        await pool.batch(query, rows, function(err) {
            console.log(err);
            logger.error(err);
            if (err) throw err;
        });
    }

    return app;
}