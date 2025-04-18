const commonUtil = require('../util/commonUtil');

module.exports = (scheduler, maria, acclogger) => {
    const app = require('express').Router();
    app.use(acclogger());

    // URL: /rankChart/userChart
    app.get('/userChart', function(req, res) {
        commonUtil.getIp(req);

        res.render('./pc/userChart');
    });

    // /rankChart/chartDate
    app.get('/chartDate', async function(req, res) {
        let chartDateList = await chartDate(req.query.season);
        if (chartDateList == null) {
            res.send({ resultCode: -1 });
        }
        res.send(chartDateList.map(row => {
            return [row.rankDateStr, 0];
        }));
    });

    app.get('/userRank', async function(req, res) {
        const { nickname, season } = req.query;

        let userRankList = await searchUserRank(nickname, season);

        if (userRankList == null) {
            res.send({ resultCode: -1 });
        }

        let result = userRankList.map(row => {
            return [row.rankDateStr, row.rankNumber]
        });

        res.send(result);
    });

    async function chartDate(season = '2022H') {
        // 랭킹차트 축이 안그리면 버그가 생기는 이슈가 있어서 1등(group by대신)을 조회하고 날짜만 수집하여 그림
        let query =
            `SELECT 
                rankDate, DATE_FORMAT(rankDate,'%m/%e') rankDateStr, 0 rankNumber 
            FROM userRank 
            WHERE season = '${season}' 
            GROUP BY rankDate
            ORDER BY rankDate asc`;

        let pool = await maria.getPool();

        try {
            let rows = await pool.query(query);
            return rows;
        } catch (err) {
            logger.error(err);
            if (res) {
                return res
                    .status(500)
                    .send('오류 발생')
                    .end();
            }
        }
        return null;
    }

    async function searchUserRank(userName, season = '2024U') {
        let query = `SELECT 
		        		DATE_FORMAT(rankDate,'%m/%e') rankDateStr, rankNumber, rankDate 
                    FROM userRank 
                    WHERE season = '${season}' 
                    and playerId = ( 
                        SELECT 
                            playerId 
                        FROM nickNames WHERE nickname= '${userName}' 
                        ORDER BY checkingDate DESC LIMIT 1
                    ) order by rankDate asc `;

        let pool = await maria.getPool();

        try {
            let rows = await pool.query(query);
            return rows;
        } catch (err) {
            logger.error(err);
        }

        return null;
    }

    return app;
}