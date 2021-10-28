const logger = require('../config/winston');

module.exports = (scheduler, maria) => {
    const app = require('express').Router();

    const axios = require("axios");
    const cheerio = require("cheerio");

    var rankSchedulerTime = "00 13 * * *";
    scheduler.scheduleJob(rankSchedulerTime, function() {
        logger.info("call rank scheduler");
        getRanks();
        logger.info("end rank scheduler");
    });

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

        for (let i = 1; i <= 150; i++) {
            if (run) {
                await getHtml(i)
                    .then(html => {
                        let rankList = [];
                        const $ = cheerio.load(html.data);
                        const $bodyList = $(".total_rank tbody tr");

                        if ($bodyList.length != 50) {
                            logger.debug("랭킹 크롤링 끝")
                            run = false;
                        }

                        $bodyList.each(function(i, row) {

                            let rank = $($(row).find("td").get(0)).clone();
                            rank.find(".chg_num").remove();

                            rankList[i] = {
                                today: todayYYYYMMDD,
                                rank: rank.text().replace(/\t/gi, "").replace("\n", ""),
                                name: $($(row).find("td").get(1)).find("a").text(),
                                rp: $($(row).find("td").get(3)).text()
                            };
                        });

                        return rankList;
                    })
                await insertRank(pool, rankList);
            }
        }
    }

    const getHtml = async(page) => {
        try {
            return await axios.get("http://cyphers.nexon.com/cyphers/article/ranking/total/19/" + page);
        } catch (error) {
            logger.error(error);
        }
    };

    async function insertRank(pool, jsonList) {
        let result = 0;

        jsonList.forEach(async function(json) {
            try {
                if (json.rp == '') {
                    return;
                }

                let query = "INSERT INTO rank (rankDate, rankNumber, playerId, nickname, season) "
                query += " SELECT '" + json.today + "', '" + json.rank + "', nick.playerId, '" + json.name + "' , '2021U' "
                query += " FROM nickNames nick"
                query += " WHERE nick.nickname = '" + json.name + "' ";

                //logger.debug(query);

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