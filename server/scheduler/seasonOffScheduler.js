const logger = require('../../config/winston');
const commonUtil = require('../util/commonUtil');
const myConfig = require('../../config/config.js');

module.exports = (scheduler, maria, acclogger) => {
    const app = require('express').Router();
    app.use(acclogger());

    //스케쥴링은 사용하지 않음?

    //test  ( "/seasonOff/charCollect" )
    app.get('/charCollect', function(req, res) {
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
            collectCharRate('2022-02-19', '2022-02-28');
            collectCharRate('2022-03-01', '2022-03-31');
            collectCharRate('2022-04-01', '2022-04-30');
            collectCharRate('2022-05-01', '2022-05-31');
            collectCharRate('2022-06-01', '2022-06-30');
            collectCharRate('2022-07-01', '2022-07-31');
            collectCharRate('2022-08-01', '2022-08-18');
        } catch (err) {
            res.send(err);
        }

        return res
            .status(200)
            .send(true)
            .end();
    });

    async function collectCharRate(startDate, endDate) {
        let query =` SELECT matchId, matchDate, matchResult, allJoin ` 
        +` FROM matchdetail WHERE matchDate BETWEEN '${startDate}' AND '${endDate}' `;
        //let query =` SELECT matchId, matchDate, matchResult, allJoin FROM matchdetail WHERE matchDate = '2022-02-18' `;
        
        pool = await maria.getPool();
        try {
            let rows = await pool.query(query);

            if(rows != null && rows.length > 0){
                let insertQuery = '';
                let groupLength = rows.length / 1000; // 천단위로 끊음
                for(let j = 0; j < groupLength ; j ++ ) {   
                    insertQuery = getInsertQuery(rows.slice(j * 1000, (j+1) *1000));
                    logger.debug(insertQuery);
                    logger.debug("\n\n\n\n\n\n\n\n\n\n");
                    await pool.query(insertQuery);
                }
            }

        } catch (err) {
            logger.error(err);
            throw err;
        }
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