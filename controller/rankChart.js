const logger = require('../config/winston');

module.exports = (scheduler, maria) => {
    const app = require('express').Router();

    app.get('/userRank', async function(req, res) {
        let userName = req.query.nickname;
        let userRankList = await searchUserRank(userName);

        if (userRankList == null) {
            res.send({ resultCode: -1 });
        }

        let result = userRankList.map(row => {
            return [row.rankDate, row.rankNumber]
        });

        res.send(result);
    });

    async function searchUserRank(userName) {
        let query = "SELECT DATE_FORMAT(rankDate,'%m/%e') rankDate, rankNumber "
        query += "FROM rank WHERE season = '2021U' "
        query += " and playerId = ( "
        query += "     SELECT playerId FROM nickNames WHERE nickname= '" + userName + "' ";
        query += " ); ";

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

    return app;
}