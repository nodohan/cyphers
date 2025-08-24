const commonUtil = require('../util/commonUtil');
const myConfig = require('../../config/config.js');
const logger = require('../../config/winston');

module.exports = (scheduler, maria) => {
    const app = require('express').Router();
    const api = require('../util/api');

    var time = "00 04 * * *"; 
    scheduler.scheduleJob(time, async function() {
        if (myConfig.schedulerRun) {
            logger.info("call match user insert scheduler");
            await selectMatchInfo(null);
            logger.info("end match user insert scheduler");
        }
    });

    // ------- 1. 포지션 특성 사용 이력 저장 [START] ------------------------
    async function selectMatchInfo() {
        let pageSize = 6000;
        let query = `SELECT matchId, jsonData, matchDate 
                     FROM matches 
                     where matchDate > '2025-04-10'
                     and jsonData IS NOT NULL and userCollect = 'N' LIMIT ${pageSize}`;

        let arr = [];
        try {
            let rows = await maria.doQuery(query);
            for (i = 0; i < rows.length; i++) {
                let row = rows[i];
                const jsonData = JSON.parse(row.jsonData);
                const players = [ ...jsonData.teams[0].players.map(player => [row.matchId, player]), ...jsonData.teams[1].players.map(player => [row.matchId, player]) ];
                arr = arr.concat(players);
            }
            // 매칭 플레이어 id 매핑 테이블 insert
            logger.debug("insertMatchUser start");
            await insertMatchUser(pool, arr);
            logger.debug("insertMatchUser end");

            logger.debug("updateMatchUserFlag start");
            await updateMatchUserFlag(pool);
            logger.debug("updateMatchUserFlag end");

        } catch (err) {
            logger.error(err.message, err);
        }
        logger.info("position collect success");
    }

    const insertMatchUser = async (pool, players) => {
        // 플레이어 아이디를 이중 배열로 처리 (벌크돌리려구)
        const insertQuery = ` insert into matches_users (matchId, playerId) values ( ?, ? ) `;

        try {
            await pool.batch(insertQuery, players, function(err) {
                console.log(err);
                logger.error(err);
                if (err) throw err;
            });
        } catch (err) {
            logger.error(err.message, err);
        }
    }
    
    const updateMatchUserFlag = async (pool) => {
        const query = `
            UPDATE matches mc
            INNER JOIN (SELECT matchId FROM matches_users GROUP BY matchId) usr ON usr.matchId = mc.matchId
            SET userCollect = 'Y' `
        await maria.doQuery(query);
    }


    return app;
}