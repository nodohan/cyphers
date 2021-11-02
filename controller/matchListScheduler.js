module.exports = (scheduler, maria) => {
    const app = require('express').Router();
    const api = require('../api');

    //스케쥴러 또는 웹 url call
    //var time = "40 23 * * *";
    var time = "30 23 * * *"; // 리얼용
    //var time = "32 23 * * *"; // 테스트중
    scheduler.scheduleJob(time, async function() {
        logger.info("call match scheduler");
        await insertMatches(null, new Date());
        logger.info("end match scheduler");
    });

    //test
    app.get('/insertMatches', function(req, res) {
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

        return insertMatches(res);
    });

    async function insertMatches(res, day) {
        let query = "SELECT playerId FROM rank where rankDate = '" + getYYYYMMDD() + "'; ";
        let pool = await maria.getPool();

        try {
            let rows = await pool.query(query);
            let result = mergeMatchIds(rows, day);
            if (res) {
                res.send(result > 0); // rows 를 보내주자
            }
        } catch (err) {
            logger.error(err);
            if (res) {
                return res
                    .status(500)
                    .send('오류 발생')
                    .end();
            }
        }
    }

    function timestamp(date) {
        date.setHours(date.getHours() + 9);
        return date.toISOString().replace('T', ' ').substring(0, 16);
    }

    async function mergeMatchIds(rows, day = new Date()) {
        let yesterday = timestamp(addDays(day, -1));
        let today = timestamp(day);

        logger.debug("search matchList today = %s, yesterday = %s", today, yesterday);

        //사용자 매칭 데이터 검색 
        let promiseItems = [];
        for (idx in rows) {
            let playerId = rows[idx].playerId;
            //logger.debug("search user matchList username= %s", playerId);

            let time = idx * 50;
            let item = new Promise((resolve, reject) => {
                setTimeout(async() => {
                    resolve(await searchUserInfoCall(playerId, yesterday, today));
                }, time);
            });
            promiseItems.push(item);
        }

        //검색 결과 Merge 후 matchId insert 
        Promise.all(promiseItems).then(resultItems => {
            let matches = [];
            for (idx in resultItems) {
                if (resultItems[idx] != null) {
                    var rows = resultItems[idx].matches.rows.map(row => row.matchId);
                    Array.prototype.push.apply(matches, rows);
                }
            }
            const setMatch = new Set(matches);
            const uniqMatch = [...setMatch];
            return insertMatchId(uniqMatch);
        });
    }

    async function searchUserInfoCall(playerId, yesterday, today) {
        logger.debug("search UserInfo Call %s", playerId);
        return new api().getUserInfoCall(playerId, "rating", yesterday, today);
    }

    async function insertMatchId(rows) {
        let result = 0;
        let pool = await maria.getPool();

        rows.forEach(async function(matchId) {
            try {
                logger.debug(matchId);
                let query = "INSERT INTO matches (matchId, season) VALUES ( '" + matchId + "', '2021U' ); "
                result += await pool.query(query);
            } catch (err) {
                logger.error(err);
            }
        });

        return result;
    }

    function getYYYYMMDD() {
        var rightNow = new Date();
        return rightNow.toISOString().slice(0, 10).replace(/-/g, "");
    }

    function addDays(date, days) {
        var result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    return app;
}