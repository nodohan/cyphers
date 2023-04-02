const logger = require('../../config/winston.js');
const commonUtil = require('../util/commonUtil');
//const rankSampleJson = require('../../sample/rankSample.js');

module.exports = (scheduler, maria) => {
    const app = require('express').Router();

    const axios = require("axios");
    //const cheerio = require("cheerio");
    const myConfig = require('../../config/config.js');

    var rankSchedulerTime = "00 13 * * *";
    //var rankSchedulerTime = "08 20 * * *";
    scheduler.scheduleJob(rankSchedulerTime, function() {
        if (myConfig.schedulerRun) {
            logger.info("call rank scheduler");
            getRanks();
            logger.info("end rank scheduler");
        }
    });

    // "/rank/getHtml"
    app.get('/getHtml', function(req, res) {
        let allowIps = ["localhost", "127.0.0.1", "221.143.115.91", ":114.207.113.136", "::1", "::ffff:127.0.0.1", "34.64.4.116"];
        const ip = req.headers['x-forwarded-for'] || req.ip;

        if (ip.indexOf(",") > 0) {
            ip = ip.toString().split(",")[1].trim();
        }

        logger.debug("call getHtml ip", ip);
        if (!allowIps.includes(ip)) {
            return res
                .status(403)
                .send('Not allow IP :' + ip + ' \n')
                .end();
        }

        getRanks();

        return res
            .status(200)
            .send(true)
            .end();
    });

    // 더미데이터로 테스트
    app.get('/getHtmlByJson', function(req, res) {
        let allowIps = ["localhost", "127.0.0.1", "221.143.115.91", ":114.207.113.136", "::1", "::ffff:127.0.0.1", "34.64.4.116"];
        const ip = req.headers['x-forwarded-for'] || req.ip;

        if (ip.indexOf(",") > 0) {
            ip = ip.toString().split(",")[1].trim();
        }

        logger.debug("call getHtml ip", ip);
        if (!allowIps.includes(ip)) {
            return res
                .status(403)
                .send('Not allow IP :' + ip + ' \n')
                .end();
        }

        //var todayYYYYMMDD = commonUtil.getYYYYMMDD();
        //insertRankSync(rankSampleJson.map(row => [todayYYYYMMDD, row.ranking, row.beforeRank, row.mNickname, row.ratingPoint]));

        return res
            .status(200)
            .send(true)
            .end();
    });

    async function getRanks() {
        /***
         * 1. cyphers 홈페이지에서 rank 받아옴
         * 2. rank_sync 테이블에 insert 
         * 3. rank_sync에서 userRank테이블로 복사
         *   조건1) rank 테이블에 insert select 하는데 beforerank가 0이 아닌 항목만 join해서 playerId를 받아와서처리 
         *   조건2) beforerank가 0인경우 nickname 테이블에서 가져와서 처리
         */
        var todayStr = commonUtil.getYYYYMMDD(new Date(), false);
        var yesterdayStr = commonUtil.getYYYYMMDD(commonUtil.addDays(new Date(), -1), false);

        logger.debug("today string %s", todayStr);

        try {
            let rankList = await getRankList(); // 1.
            await insertRankSync(rankList); // 2. 
            await insertRankBySync(todayStr, yesterdayStr); // 3.
        } catch (err) {
            console.log(err);
            logger.error("insert rank fail");
            logger.error(err.message);
        }
    }

    async function insertRankBySync(today, yesterday) {
        let hasBefore = `
            INSERT INTO userRank
            SELECT 
                '${today}', sy.rankNumber, ur.playerId, sy.nickname, '2023H', sy.rp  
            FROM rank_sync sy
            INNER JOIN (
                SELECT playerId, rankNumber, nickname 
                FROM userRank WHERE rankDate = '${yesterday}'
            ) ur ON ur.rankNumber = sy.ranknumberbefore AND ur.nickname = sy.nickname 
            WHERE sy.ranknumberbefore != 0`;
        logger.debug(hasBefore);

        let emtpyBefore = `
            INSERT INTO userRank
            SELECT
               '${today}', sy.rankNumber, ln.playerId, sy.nickname, '2023H', sy.rp 
            FROM (
                SELECT distinct nm.nickname, nm.playerId FROM nickNames nm
                INNER JOIN ( 
                   SELECT playerId, MAX(checkingDate) checkingDate FROM nickNames GROUP BY playerId  
                ) lastNickname ON lastNickname.playerId = nm.playerId AND lastNickname.checkingDate = nm.checkingDate
                GROUP BY nm.nickname 
                ORDER BY MAX(lastNickname.checkingDate)
            ) ln
            INNER JOIN ( 
                SELECT * FROM rank_sync 
                WHERE nickname NOT IN (
                    SELECT nickname FROM userRank WHERE rankDate = '${today}'
                )
            ) sy  ON sy.nickname = ln.nickname`
        logger.debug(emtpyBefore);

        let pool = await maria.getPool();

        //어제 랭킹이 존재하는사람
        await pool.query(hasBefore);

        //어제 랭킹이 존재하지 않는사람 ( ranknumberbefore = 0)
        await pool.query(emtpyBefore);

        // 이렇게 해도 닉변후에 랭킹이 사라진 후 다시 랭킹에 들어오게 되면 누락될 수 있음.
        // 이런 건은 차후 해결 하기로 함. 

        logger.debug("end insertRankBySync");
    }

    async function getRankList() {
        let i = 1;
        let html = await getHtml(i++);
        const last = html.data.pagination.totalPage;

        let rankList = makeArr(html);
        console.log(rankList);

        while (++i <= last) {
            html = await getHtml(i);
            let arr = makeArr(html);
            console.log(arr);
            rankList.push(...arr);
        }
        return rankList;
    }

    function makeArr(html) {
        if (!html.data) {
            return [];
        }
        let arr = [];
        html.data.rankingTopResponses.forEach(row => {
            arr.push([row.mNickname, row.ranking, row.beforeRank, row.ratingPoint])
        });
        return arr;
    }

    /***
     * 
        [{
            curDate: '2022-12-16',
            ranking: 5306,
            beforeRank: 5256,
            ratingPoint: 1262,
            mGrade: 92,
            mNickname: '가나다라마바사',
            clanName: '어쩌고저쩌고'
           }] 
    */
    const getHtml = async(page) => {
        try {
            return await axios.get("http://cyphers.nexon.com/ranking/total/22?page=" + page);
        } catch (error) {
            logger.error(error);
        }
    };

    async function insertRankSync(arrList) {
        logger.debug("insert ranking length = " + arrList.length);

        let pool = await maria.getPool();
        let conn = await pool.getConnection();

        try {
            await conn.beginTransaction();
            try {
                conn.query("DELETE FROM rank_sync ");

                let query = ` INSERT INTO rank_sync 
                                  (nickname, rankNumber, rankNumberBefore, rp) 
                              VALUES
                                  ( ?, ?, ?, ? ) `;

                await conn.batch(query, arrList);
                await conn.commit();
            } catch (err) {
                console.log(err);
                logger.error(err.message);
                await conn.rollback();
            }
        } catch (err2) {
            logger.error(err2.message);
        }
        logger.debug("insert ranking end");

    }

    return app;
}
