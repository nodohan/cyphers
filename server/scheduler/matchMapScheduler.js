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
            let isRun = true;
            while(isRun) {
                isRun = await selectMatches(res, '2024-09-25');
            }
            logger.info("end match map scheduler");
        }
    });

    //test  ( "/matchesMap/insertMatchesMap" )
    app.get('/insertMatchesMap', async function(req, res) {
        if (!commonUtil.isMe(req)) {
            return res.send({ "resultCode": "400", "resultMsg": "내가 아닌데??" });
        }

        res.send({ "resultCode": "200", "resultMsg": "내가 맞다" });
        let isRun = true;
        while(isRun) {
            isRun = await selectMatches('2024-09-27');
        }
    });

    selectMatches = async (day = new Date()) => {
        //let searchDateStr = commonUtil.getYYYYMMDD(commonUtil.addDays(day, -1));
        const query = `
        select 
            matchId, jsonData
        from matches 
        where matchId in ( 
            SELECT ma.matchId
            FROM matches ma
            LEFT JOIN (
                select matchId from matches_map group by matchId
            ) map ON map.matchId = ma.matchId 
            WHERE matchDate >= '${day}' AND map.matchId IS NULL
        ) limit 3000`;
       
        logger.debug(query);
        let matchMap = [];

        let pool = await maria.getPool();
        try {
            let rows = await pool.query(query);
            matchMap = extractPlayerId(rows);
            await insertMatchId(matchMap);
        } catch (err) {
            console.log("에러1",err);
            logger.error(err);
        }
        return matchMap.length > 0;
    }

    function extractPlayerId(rows) {
        logger.debug("extract players");

        //사용자 매칭 데이터 검색 
        let items = [];
        rows.forEach(row => {
            const { matchId, jsonData } = row;
            let json = JSON.parse(jsonData);
            const teams = json.teams;
            json.players.forEach(row2 => {
                row2["matchId"] = matchId;
                row2.playInfo.result = teams[0].players.some(playerId => playerId == row2.playerId) ? teams[0].result : teams[1].result;
                items.push([matchId, row2.playerId, row2 ]);
            });
        });

        return items;
    }

    async function insertMatchId(rows) {
        let pool = await maria.getPool();        
        let query = `INSERT INTO matches_map (matchId, playerId, jsonData) VALUES ( ?, ?, ? ) `;
        logger.debug(query);

        await pool.batch(query, rows, function(err) {
            console.log(err);
            logger.error(err);
            if (err) throw err;
        });
    }

    return app;
}