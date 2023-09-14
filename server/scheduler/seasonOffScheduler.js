const commonUtil = require('../util/commonUtil');
const myConfig = require('../../config/config.js');

module.exports = (scheduler, maria, acclogger) => {
    const app = require('express').Router();
    app.use(acclogger());

    //스케쥴링은 사용하지 않음?

    //test  ( "/seasonOff/charCollect" )
    app.get('/charCollect', async function(req, res) {
        let allowIps = ["localhost", "127.0.0.1", "221.143.115.91", ":114.207.113.136", "::1", "::ffff:127.0.0.1", "34.64.4.116"];
        const ip = req.headers['x-forwarded-for'] || req.ip;

        if (ip.indexOf(",") > 0) {
            ip = ip.toString().split(",")[1].trim();
        }

        logger.debug("call charCollect ip", ip);
        if (!allowIps.includes(ip)) {
            return res
                .status(403)
                .send('Not allow IP :' + ip + ' \n')
                .end();
        }

        try {
            //데이터 많으니 분할처리
            await collectCharRate('2023-02-23', '2023-03-22');
            await collectCharRate('2023-03-23', '2023-04-22');
            await collectCharRate('2023-04-23', '2023-05-22');
            await collectCharRate('2023-05-23', '2023-06-22');
            await collectCharRate('2023-06-23', '2023-07-22');
            await collectCharRate('2023-07-23', '2023-08-22');
            await collectCharRate('2023-08-23', '2023-09-13');
        } catch (err) {
            res.send(err);
        }

        return res
            .status(200)
            .send(true)
            .end();
    });

    async function collectCharRate(startDate, endDate) {
        let query = ` SELECT matchId, matchDate, matchResult, allJoin 
                      FROM matchdetail WHERE matchDate BETWEEN '${startDate}' AND '${endDate}' `;

        pool = await maria.getPool();
        try {
            let rows = await pool.query(query);
            const splitSize = 1000;

            if (rows != null && rows.length > 0) {
                let insertQuery = '';
                let groupLength = rows.length / splitSize; // 천단위로 끊음
                for (let j = 0; j < groupLength; j++) {
                    try {
                        insertQuery = getInsertQuery(rows.slice(j * splitSize, (j + 1) * splitSize));
                        logger.debug(insertQuery);
                        logger.debug("\n\n\n\n\n\n\n\n\n\n");
                        await pool.query(insertQuery);
                    } catch (err) {
                        console.log(err);
                    }
                }
            }

        } catch (err) {
            logger.error(err);
            throw err;
        }
        return;
    }

    function getInsertQuery(rows) {
        let insertQuery = `insert into matches_char ( matchId, matchDate, matchResult, charName ) values `;
        let charArr = [];

        rows.forEach(row => {
            row.allJoin.split("|").forEach(char => {
                charArr.push(` ( '${row.matchId}', '${row.matchDate}', '${row.matchResult}', '${char}' ) `);
            });
        });

        insertQuery += charArr.join(", \n");
        return insertQuery;
    }

    return app;
}