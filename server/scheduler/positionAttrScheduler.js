const commonUtil = require('../util/commonUtil');
const myConfig = require('../../config/config.js');

module.exports = (scheduler, maria) => {
    const app = require('express').Router();
    const api = require('../util/api');

    //스케쥴러 또는 웹 url call
    //var time = "40 23 * * *";
    //var time = "00 03 * * *"; // 리얼용
    var time = "00 03 * * *"; // 테스트중
    scheduler.scheduleJob(time, async function() {
        if (myConfig.schedulerRun) {
            logger.info("call position attr collect scheduler");
            await selectMatchInfo(null);
            positionStats();
            logger.info("end position attr collect scheduler");
        }
    });

    //test  ( "/positionSche/insertPosition" )  // 1번 이거먼저 그다음 2번 시행
    app.get('/insertPosition', function(req, res) {
        if (!commonUtil.isMe(req)) {
            return res
                .status(403)
                .send('Not allow IP')
                .end();
        }

        return selectMatchInfo(res);
    });

    //test  ( "/positionSche/positionStats" ) // 2번
    app.get('/positionStats', function(req, res) {
        if (!commonUtil.isMe(req)) {
            return res
                .status(403)
                .send('Not allow IP')
                .end();
        }

        return positionStats(res);
    });


    // ------- 1. 포지션 특성 사용 이력 저장 [START] ------------------------
    async function selectMatchInfo(res, day = new Date()) {
        let pageSize = 3000;
        let searchDateStr = commonUtil.getYYYYMMDD(commonUtil.addDays(day, -2));
        let query = `SELECT matchId, jsonData, matchDate 
                     FROM matches where matchDate > '${searchDateStr}' 
                     AND jsonData IS NOT NULL and positionCollect = 'N' LIMIT ${pageSize}`;

        let 
        try {
            let rows = await maria.doQuery(query);
            for (i = 0; i < rows.length; i++) {
                let row = rows[i];
                const jsonData = JSON.parse(row.jsonData);
                //특성 정보 insert
                await insertPositionAttr(pool, row.matchId, jsonData);

                // 매칭 플레이어 id 매핑 테이블 insert
                try {
                    await insertMatchUser(pool, row.matchId, jsonData);
                } catch (matchInsertError) {
                    logger.error("match player insert error", matchInsertError);
                }
            }

        } catch (err) {
            logger.error(err.message);
            if (res) {
                return res
                    .status(500)
                    .send('오류 발생')
                    .end();
            }
        }
        logger.info("position collect success");

        if (res) {
            return res
                .status(200)
                .send(true.toString() + new Date().toISOString())
                .end();
        }
    }

    const insertMatchUser = async (pool, matchId, row) => {
        // 플레이어 아이디를 이중 배열로 처리 (벌크돌리려구)
        const players = [ ...row.teams[0].players.map(row => [row]), ...row.teams[1].players.map(row => [row]) ];
        const insertQuery = ` insert into matches_users (matchId, playerId) values ( '${matchId}' , ? )  `;

        try {
            await pool.batch(insertQuery, players, function(err) {
                console.log(err);
                logger.error(err);
                if (err) throw err;
            });
        } catch (err) {
            logger.error(err.message);
        }
    }

    async function insertPositionAttr(pool, matchId, row) {
        let matchDate = row.date.substring(0, 10);
        let map = row.map.name;
        let winTeam = row.teams[0].result == 'win' ? row.teams[0].players : row.teams[1].players;

        let insertQuery = `insert into position_attr 
                                (matchId, charName, matchDate, matchResult, map
                                , position, attrs, attr_lv1, attr_lv2, attr_lv3, attr_lv4 ) 
                            values ( ?, ?, ?, ?, ?
                                   , ?, ?, ?, ?, ?
                                   , ? )`;

        let arr = [];
        var tmpAttr = null;
        row.players.forEach((player) => {
            //특성이 4개로 확장됨에 따른 수정진행하는데, 2,3특은 같은거라 ㅡㅡ;;
            const charName = player.playInfo.characterName;
            const matchResult = winTeam.includes(player.playerId) ? "win" : "lose";
            const position = player.position.name;                        
            const attr1 = player.position.attribute[0].name;
            let attr2 = player.position.attribute[1].name;
            let attr3 = player.position.attribute[2].name;
            const attr4 = player.position.attribute[3].name;

            //어쨋거나 한방향으로 소팅
            if(attr2 < attr3) {
                tmpAttr = attr2;
                attr2 = attr3;
                attr3 = tmpAttr;
            }

            const attrs = attr1 + "/" + attr2 + "/" + attr3 + "/" + attr4;
            arr.push([matchId, charName, matchDate, matchResult, map, position, attrs, attr1, attr2, attr3, attr4]);
        });

        //logger.debug(arr);

        try {
            await pool.batch(insertQuery, arr, function(err) {
                console.log(err);
                logger.error(err);
                if (err) throw err;
            });

            let updateQuery = `update matches set positionCollect = 'Y' where matchId = '${matchId}' `;
            await maria.doQuery(updateQuery);

        } catch (err) {
            logger.error(err.message);
        }
    }
   

    // ------- 1. 포지션 특성 사용 이력 저장 [end] ------------------------


    // ------- 2. 포지션 특성 통계 저장 [start] ------------------------

    async function positionStats(res) {
        let seasonOpoenDay = '2024-09-26';
        let checkDate = commonUtil.getYYYYMMDD(new Date(), false);
        let aWeekAgo = commonUtil.getYYYYMMDD(commonUtil.addDays(new Date(), -8), false);

        //이번시즌부터 계산처리
        if(seasonOpoenDay > aWeekAgo) {
            aWeekAgo = seasonOpoenDay;
        }

        logger.info("positionStats collect start");

        let 
        try {

            //###### 데이터 집계 [START] ################
            //시즌 - 집계
            await insertPositionAttrResult(pool, checkDate, 'all', 'all', seasonOpoenDay, false);
            //주간 - 집계
            await insertPositionAttrResult(pool, checkDate, 'W', 'all', aWeekAgo, false);

            //캐릭터 시즌 
            await insertPositionAttrResult(pool, checkDate, 'all', 'all', seasonOpoenDay, true);
            //캐릭터 주간  
            await insertPositionAttrResult(pool, checkDate, 'W', 'all', aWeekAgo, true);

            //###### 데이터 집계 [END] ################

            // 시즌통계 top5 
            await insertPositionAttrStats(pool, checkDate, 'all', 10);
            await insertPositionAttrStats(pool, checkDate, 'W', 10);

        } catch (err) {
            logger.error(err.message);
            if (res) {
                return res
                    .status(500)
                    .send('오류 발생')
                    .end();
            }
        }
        logger.info("positionStats collect end");
        if (res) {
            return res
                .status(200)
                .send(true.toString() + new Date().toISOString())
                .end();
        }
    }

    /**
     * 1차 필터링한 결과를 position_attr_result 에 저장후  
     * 2차로 각포지션별 5등안에 드는 애들을 position_attr_stats 에 넣는다. 
     *  -> 요건 insertPositionAttrStats() 에서 진행
     * 
     * @param checkDate 
     * @param checkType : ALL-이번시즌 / W-최근일주 / D-일일 (일별은 하지말까..)
     * @param lv `
     * @param matchDate 
     */
    async function insertPositionAttrResult(pool, checkDate, checkType, lv, matchDate, isChar) {
        let lvColumn = lv == 'all' ? 'attrs' : `attr_${lv}`;
        let query = `INSERT INTO position_attr_result
             SELECT aa.*, ROUND( (aa.win / aa.total * 100), 2) rate 
             FROM (
             	SELECT 
             		'${checkDate}'
             		, '${checkType}'
                    , ${isChar ? 'charName' : "'all'" } as charName
             		, POSITION
             		, '${lv}' TYPE
             		, ${lvColumn}
             		, COUNT(1) total
             		, COUNT(IF(matchResult = 'win' , 1, NULL)) win 
             		, COUNT(IF(matchResult = 'lose', 1, NULL)) lose 	
             	FROM position_attr 
             	WHERE matchDate >= '${matchDate}'
             	GROUP BY ${isChar ? 'charName,' : '' } POSITION, ${lvColumn}
             ) aa 
             ORDER BY charName, POSITION, total DESC `;

        //logger.debug('insertPositionAttrResult %s', query);
        await maria.doQuery(query);
    }

    async function insertPositionAttrStats(pool, checkDate, checkType, rankNum) {
        let query = ` INSERT INTO position_attr_stats 
             SELECT checkDate, checktype, charName, POSITION, position_type, attr, total, win, lose, rate
             FROM (  
                SELECT 
                    result.*
                    , ROW_NUMBER() OVER(PARTITION BY charName, POSITION, position_type ORDER BY total DESC) AS total_rank
                FROM position_attr_result result
             	WHERE checkDate = '${checkDate}'  
             	AND checkType = '${checkType}' 
             	ORDER BY charName, POSITION, position_type, total DESC 
             ) aa 
             WHERE aa.total_rank <= ${rankNum} `;

        //logger.debug('insertPositionAttrStats %s', query);

        await maria.doQuery(query);
    }

    // ------- 포지션 특성 통계 저장 [end] ------------------------

    return app;
}