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
            await collectCharRate('2022-08-19', '2022-08-31');
            await collectCharRate('2022-09-01', '2022-09-30');
            await collectCharRate('2022-10-01', '2022-10-31');
            await collectCharRate('2022-11-01', '2022-11-30');
            await collectCharRate('2022-12-01', '2022-12-31');
            await collectCharRate('2023-01-01', '2023-01-31');
            await collectCharRate('2023-02-01', '2023-02-22');
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
        //let query =` SELECT matchId, matchDate, matchResult, allJoin FROM matchdetail WHERE matchDate = '2022-02-18' `;

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