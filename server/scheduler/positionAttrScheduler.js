const logger = require('../../config/winston');
const commonUtil = require('../util/commonUtil');
const myConfig = require('../../config/config.js');

module.exports = (scheduler, maria) => {
    const app = require('express').Router();
    const api = require('../../api');

    //스케쥴러 또는 웹 url call
    //var time = "40 23 * * *";
    //var time = "00 03 * * *"; // 리얼용
    var time = "51 23 * * *"; // 테스트중
    scheduler.scheduleJob(time, async function() {
        //if (myConfig.schedulerRun) {
        logger.info("call position attr collect scheduler");
        await selectPositionAttr(null);
        positionStats();
        logger.info("end position attr collect scheduler");
        //}
    });

    //test  ( "/positionSche/insertPosition" )
    app.get('/insertPosition', function(req, res) {
        let allowIps = ["localhost", "127.0.0.1", "221.143.115.91", ":114.207.113.136", "::1", "::ffff:127.0.0.1", "34.64.4.116"];
        const ip = req.headers['x-forwarded-for'] || req.ip;

        if (ip.indexOf(",") > 0) {
            ip = ip.toString().split(",")[1].trim();
        }

        logger.debug("call insertPosition ip", ip);
        if (!allowIps.includes(ip)) {
            return res
                .status(403)
                .send('Not allow IP :' + ip + ' \n')
                .end();
        }

        return selectPositionAttr(res);
    });

    //test  ( "/positionSche/positionStats" )
    app.get('/positionStats', function(req, res) {
        let allowIps = ["localhost", "127.0.0.1", "221.143.115.91", ":114.207.113.136", "::1", "::ffff:127.0.0.1", "34.64.4.116"];
        const ip = req.headers['x-forwarded-for'] || req.ip;

        if (ip.indexOf(",") > 0) {
            ip = ip.toString().split(",")[1].trim();
        }

        logger.debug("call positionStats ip", ip);
        if (!allowIps.includes(ip)) {
            return res
                .status(403)
                .send('Not allow IP :' + ip + ' \n')
                .end();
        }

        return positionStats(res);
    });


    // ------- 1. 포지션 특성 사용 이력 저장 [START] ------------------------

    async function selectPositionAttr(res, day = new Date()) {
        let pageSize = 3000;
        let searchDateStr = commonUtil.getYYYYMMDD(commonUtil.addDays(day, -2));
        //let searchDateStr = '2022-08-21';
        let query = `SELECT matchId, jsonData, matchDate FROM matches where matchDate > '${searchDateStr}' AND jsonData IS NOT NULL and positionCollect = 'N' LIMIT ${pageSize}`;

        let pool = await maria.getPool();
        try {
            let rows = await pool.query(query);
            for (i = 0; i < rows.length; i++) {
                let row = rows[i];
                await insertPositionAttr(pool, row.matchId, JSON.parse(row.jsonData));
                logger.debug(`position collect end matchId = ${row.matchId}`);
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

    async function insertPositionAttr(pool, matchId, row) {
        let matchDate = row.date.substring(0, 10);
        let map = row.map.name;
        let winTeam = row.teams[0].result == 'win' ? row.teams[0].players : row.teams[1].players;

        try {
            await row.players.forEach(async(player) => {
                let charName = player.playInfo.characterName;
                let matchResult = winTeam.includes(player.playerId) ? "win" : "lose";
                let position = player.position.name;
                let attr1 = player.position.attribute[0].name;
                let attr2 = player.position.attribute[1].name;
                let attr3 = player.position.attribute[2].name;
                let attrs = attr1 + "/" + attr2 + "/" + attr3;

                let insertQuery = `insert into position_attr ` +
                    `(matchId, charName, matchDate, matchResult, ` +
                    ` map, position, attrs, attr_lv1, attr_lv2, attr_lv3 ) ` +
                    `values ( '${matchId}', '${charName}', '${matchDate}', '${matchResult}' ` +
                    ` , '${map}', '${position}', '${attrs}', '${attr1}', '${attr2}', '${attr3}' ) `;
                //logger.debug(insertQuery);

                await pool.query(insertQuery);
            });

            let updateQuery = `update matches set positionCollect = 'Y' where matchId = '${matchId}' `;
            pool.query(updateQuery);

        } catch (err) {
            logger.error(err.message);
        }
    }

    // ------- 1. 포지션 특성 사용 이력 저장 [end] ------------------------


    // ------- 2. 포지션 특성 통계 저장 [start] ------------------------

    async function positionStats(res) {
        let checkDate = commonUtil.getYYYYMMDD(new Date(), false);
        let aWeekAgo = commonUtil.getYYYYMMDD(commonUtil.addDays(new Date(), -8), false);

        logger.info("positionStats collect start");

        let pool = await maria.getPool();
        try {

            //###### 데이터 집계 [START] ################
            //시즌 - 집계
            await insertPositionAttrResult(pool, checkDate, 'all', 'all', '2022-08-22', false);
            //await insertPositionAttrResult(pool, checkDate, 'all', 'lv1', '2022-08-22', false);
            //await insertPositionAttrResult(pool, checkDate, 'all', 'lv2', '2022-08-22', false);
            //await insertPositionAttrResult(pool, checkDate, 'all', 'lv3', '2022-08-22', false);

            //주간 - 집계
            await insertPositionAttrResult(pool, checkDate, 'W', 'all', aWeekAgo, false);
            //await insertPositionAttrResult(pool, checkDate, 'W', 'lv1', aWeekAgo, false);
            //await insertPositionAttrResult(pool, checkDate, 'W', 'lv2', aWeekAgo, false);
            //await insertPositionAttrResult(pool, checkDate, 'W', 'lv3', aWeekAgo, false);

            //캐릭터 시즌 
            await insertPositionAttrResult(pool, checkDate, 'all', 'all', '2022-08-22', true);
            //캐릭터 주간  
            await insertPositionAttrResult(pool, checkDate, 'W', 'all', aWeekAgo, true);

            //###### 데이터 집계 [END] ################

            // 시즌통계 top5 
            await insertPositionAttrStats(pool, checkDate, 'all', 5);
            await insertPositionAttrStats(pool, checkDate, 'W', 5);

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
     * @param lv 
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

        logger.debug('insertPositionAttrResult %s', query);
        await pool.query(query);
    }

    async function insertPositionAttrStats(pool, checkDate, checkType, rankNum) {
        let query = ` INSERT INTO position_attr_stats 
             SELECT checkDate, checktype, charName, POSITION, position_type, attr, total, win, lose, rate
             FROM (  
             	SELECT result.*  
             		, CASE  
             		WHEN @GRP = POSITION  
             			THEN @ROWNUM:=@ROWNUM + 1  
             			ELSE @ROWNUM :=1  
             		END AS ROWNUM 
             		, (@GRP := POSITION) AS dummy 
             	FROM position_attr_result result, (SELECT @ROWNUM:=0, @GRP:='') R  
             	WHERE checkDate = '${checkDate}'  
             	AND checkType = '${checkType}' 
             	ORDER BY charName, POSITION, position_type, total DESC 
             ) aa 
             WHERE aa.rownum <= ${rankNum} `;

        logger.debug('insertPositionAttrStats %s', query);

        await pool.query(query);
    }


    // ------- 포지션 특성 통계 저장 [end] ------------------------





    return app;
}