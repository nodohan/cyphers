module.exports = (scheduler, maria) => {
    const app = require('express').Router();

    const axios = require("axios");
    const cheerio = require("cheerio");
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

        logger.debug("call insertMatches ip", ip);
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

    async function getRanks() {
        var pool = await maria.getPool();
        let run = true;
        var todayYYYYMMDD = getYYYYMMDD();

        logger.debug("today string %s", todayYYYYMMDD);

        //for (let i = 1; i <= 140; i++) {
        for (let i = 1; i <= 140; i++) {
            if (run) {
                let html = await getHtml(i);
                //console.log(html);
                let rankList = [];
                const $bodyList = html.data.rankingTopResponses;

                //console.log($bodyList);
                if ($bodyList.length < 50) {
                    logger.debug("랭킹 크롤링 끝");
                    run = false;
                }

                $bodyList.forEach(function(row, i) {
                    //console.log(row);

                    rankList[i] = {
                        today: todayYYYYMMDD,
                        rank: row.ranking,
                        name: row.mNickname,
                        //name: $($(row).find("td").get(1)).text(),
                        rp: row.ratingPoint
                    };
                });
                //logger.debug("랭킹 페이지 %s! insert 시작 ", i);
                await insertRank(pool, rankList);
            }
        }
    }

    const getHtml = async(page) => {
        try {
            return await axios.get("http://cyphers.nexon.com/ranking/total/21?page=" + page);
        } catch (error) {
            logger.error(error);
        }
    };

    async function insertRank(pool, jsonList) {
        let result = 0;

        jsonList.forEach(async function (json) {
            try {
                let query = ` INSERT INTO userRank (rankDate, rankNumber, playerId, nickname, season, rp) ` +
                    ` SELECT '${json.today}', '${json.rank}', nick.playerId, '${json.name}' , '2022U', ${json.rp} ` +
                    ` FROM nickNames nick ` +
                    ` WHERE nick.nickname = '${json.name}' ORDER BY checkingDate DESC LIMIT 1 `;

                logger.debug(query);

                result += await pool.query(query);
            } catch (err) {
                logger.error(err);
            }
        })

        return result == jsonList.length;
    }

    function getYYYYMMDD() {
        var rightNow = new Date();
        return rightNow.toISOString().slice(0, 10).replace(/-/g, "");
    }

    return app;
}