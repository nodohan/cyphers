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
                isRun = await selectMatches('2024-09-25');
            }
            logger.info("end match map scheduler");
        }
    });

    //test  ( "/matchesMap/insertMatchesMap?day=2025-06-10" )
    app.get('/insertMatchesMap', async function(req, res) {
        if (!commonUtil.isMe(req)) {
            return res.send({ "resultCode": "400", "resultMsg": "내가 아닌데??" });
        }

        res.send({ "resultCode": "200", "resultMsg": "내가 맞다" });
        let isRun = true;
        while(isRun) {
            isRun = await selectMatches(day);
        }
    });

    
    //test  ( "/matchesMap/updateMatchesMap" )
    app.get('/updateMatchesMap', async function(req, res) {
        if (!commonUtil.isMe(req)) {
            return res.send({ "resultCode": "400", "resultMsg": "내가 아닌데??" });
        }

        res.send({ "resultCode": "200", "resultMsg": "내가 맞다" });
        updatePositionBatch();
    });

    
    //test  ( "/matchesMap/getMatchesMap" )
    app.get('/getMatchesMap', async function(req, res) {        
        
        const playerId = req.query.playerId;
        if(playerId == null) {
            res.send({ "resultCode": "400", "resultMsg": "잘못검색함" });
            return ;
        }
        res.send(await getUserMatchesMap(req.query.playerId));
    });


    //test  ( "/matchesMap/teamRate?playerIds=1826e7c7f0becbc1e65ee644c28f0072&playerIds=b2612be939898da38f08143a09c97412" )
    app.get('/teamRate', async function(req, res) {        
        
        const playerIds = req.query.playerIds;
        if(playerIds == null || playerIds.length == 0) {
            res.send({ "resultCode": "400", "resultMsg": "잘못검색함" });
            return ;
        }
        res.send(await teamRate(playerIds));
    });

    teamRate = async (playerIds) => {
        const cnt = playerIds.length <= 3 ? 2 : 3;
        const playerStr = playerIds.map(() => '?').join(', ');

        const query = `
        SELECT
            CONCAT(ROUND(SUM(CASE WHEN result = 'win' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), '%') AS win_rate,
            COUNT(*) AS total_games
        FROM (
            SELECT matchId, result
            FROM matches_map
            WHERE playerId IN (${playerStr})
            GROUP BY matchId, result
            HAVING COUNT(playerId) >= ${cnt}
        ) AS sub `;

        logger.info("query: %s", query);

        try {
            return await maria.doQuery(query, [ ... playerIds ]);
        } catch (err){
            logger.err(err);
        }
        return null;
    }

    getUserMatchesMap =  async (playerId) => {
        const query = `
            SELECT 
                playerId,
                POSITION,
                SUM(CASE WHEN result = 'win' THEN 1 ELSE 0 END) AS win_count,
                SUM(CASE WHEN result = 'lose' THEN 1 ELSE 0 END) AS lose_count,
                COUNT(*) AS total_games
            FROM matches_map
            WHERE POSITION IS NOT NULL
            and playerId = ? 
            GROUP BY playerId, POSITION
            `;
       
        return await maria.doQuery(query, [ playerId ]);
    }

    selectMatches = async (day = new Date()) => {
        //let searchDateStr = commonUtil.getYYYYMMDD(commonUtil.addDays(day, -1));
        const query = `
        select 
            matchId, jsonData, matchDate
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

        let 
        try {
            let rows = await maria.doQuery(query);
            matchMap = extractPlayerId(rows);
            await insertMatchId(matchMap);
        } catch (err) {
            console.log("에러1",err);
            logger.error(err);
        }
        return matchMap.length > 0;
    }

    const extractPlayerId = (rows) => {
        logger.debug("extract players");

        //사용자 매칭 데이터 검색 
        let matchMap = [];
        rows.forEach(row => {
            const { matchId, jsonData, matchDate} = row;
            let json = JSON.parse(jsonData);
            const teams = json.teams;
            json.players.forEach(row2 => {
                const { itemPurchase, items, playerId } = row2;
                row2["matchId"] = matchId;
                row2["date"] = matchDate;
                row2.playInfo.result = teams[0].players.some(playerId => playerId == row2.playerId) ? teams[0].result : teams[1].result;
                matchMap.push([matchId, playerId, row2, matchDate, row2.playInfo.result, classifyBuild(itemPurchase, items) ]);
            });
        });

        return matchMap;
    }

    function classifyBuild(itemPurchase, items) {
        const itemMap = new Map();
        for (const item of items) {
            itemMap.set(item.itemId, item);
        }
    
        const firstFiveItems = itemPurchase.slice(0, 8)
            .map(id => itemMap.get(id))
            .filter(Boolean);
    
        const glovesCount = firstFiveItems.filter(item => item.slotName === "손(공격)").length;
        const chestExists = firstFiveItems.some(item => item.slotName === "가슴(체력)");
        const helmetCount = firstFiveItems.filter(item => item.slotName === "머리(치명)").length;
    
        if (glovesCount === 0) return "극방";
        if (glovesCount === 1) return "방벨";
        if (glovesCount >= 2) {
            if (!chestExists && helmetCount >= 2) return "극공";
            return "공벨";
        }
        return "기타";
    }
    
    async function insertMatchId(rows) {
        let query = `INSERT INTO matches_map (matchId, playerId, jsonData, matchDate, result) VALUES ( ?, ?, ?, ? ) `;
        logger.debug(query);

        await pool.batch(query, rows, function(err) {
            console.log(err);
            logger.error(err);
            if (err) throw err;
        });
    }
    
    const updatePositionBatch = async() => {
        const batchSize = 1000;        
        while (true) {
            const rows = await maria.doQuery(`SELECT jsonData FROM matches_map WHERE position IS NULL ORDER BY matchId ASC LIMIT ?`,[batchSize]);           

            if (rows.length === 0) break;
        
            for (const row of rows) {
                try {
                    const jsonData = JSON.parse(row.jsonData);
                    const {playerId, matchId } = jsonData;
                    const result = jsonData.playInfo?.result ?? null;
                    const itemPurchase = jsonData.itemPurchase ?? [];
                    const items = jsonData.items ?? [];
            
                    const position = classifyBuild(itemPurchase, items);
            
                    await maria.doQuery(`UPDATE matches_map SET result = ?, position = ? WHERE matchId = ? and playerId = ?`, [result, position, matchId, playerId]);
                } catch (err) {
                    console.error(`❌ ID ${row.id} 처리 실패:`, err.message);
                    // 실패했어도 진행
                }
            }
        }
    
        await pool.end();
    }      

    return app;
}