const commonUtil = require('../util/commonUtil');
const myConfig = require('../../config/config.js');

module.exports = (scheduler, maria, acclogger) => {
    const app = require('express').Router();
    app.use(acclogger());

    //스케쥴링은 사용하지 않음?

    //test  ( "/seasonOff/charCollect" )
    app.get('/charCollect', async function(req, res) {
        if (!commonUtil.isMe(req)) {
            return res.send({ "resultCode": "400", "resultMsg": "내가 아닌데??" });
        }

        try {
            //2024-09-25 ~ 2025-04-10
            //데이터 많으니 분할처리
            await collectCharRate('2024-09-26', '2024-10-10');
            await collectCharRate('2024-10-11', '2024-11-10');
            await collectCharRate('2024-11-11', '2024-12-10');
            await collectCharRate('2024-12-11', '2025-01-10');
            await collectCharRate('2025-01-11', '2025-02-10');
            await collectCharRate('2025-02-11', '2025-03-10');
            await collectCharRate('2025-03-11', '2025-04-10');
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