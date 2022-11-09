const commonUtil = require('../util/commonUtil');

module.exports = (scheduler, maria, acclogger) => {
    const app = require('express').Router();
    app.use(acclogger());

    app.get('/combi', function (req, res) {
        if (commonUtil.isMobile(req)) {
            res.render('./mobile/combi');
        } else {
            res.render('./pc/combi');
        }
    });

    app.get('/combiTotalCount', async function (req, res) {
        pool = await maria.getPool();

        try {
            let query = "SELECT COUNT(1) cnt FROM matches WHERE matchdate IS NOT NULL and season = '2021U' ";
            let [result] = await pool.query(query);
            res.send({ 'totalCount': result.cnt })
        } catch (err) {
            logger.error(err);
            return res
                .status(500)
                .send('오류 발생')
                .end();
        }
    });

    app.get('/combiSearch', async function (req, res) {
        let type = req.query.position;
        let count = req.query.count;
        let order = req.query.order == 'count' ? 'total' : 'late';
        if (count == null) {
            count = 10;
        }

        let query = `SELECT *, CEILING( win / total * 100 ) AS late 
			 FROM (
				SELECT 
					${type} as combi, COUNT(1) total
					, COUNT(IF(matchResult = '승', 1, NULL)) win
					, COUNT(IF(matchResult = '패', 1, NULL)) lose 
					, GROUP_CONCAT(detail.matchId) matchIds 
				FROM matchdetail detail 
				inner join ( 
					select 
						matchId, matchDate 
					from matches
                    where matchDate between '${req.query.fromDt}' and '${req.query.toDt}'
				) matches on matches.matchId = detail.matchId
				WHERE 1=1 `;

        if (req.query.charName) {
            let charNames = req.query.charName.split(" ");
            for (idx in charNames) {
                query += ` and "${type}" like '%${charNames[idx]}%' `;
            }

            if (req.query.count == null && charNames.length >= 3) {
                count = 1;
            }
        }
        query += `    GROUP BY ${type}
                  ) a 
                  WHERE total >= ${count}
                  ORDER BY ${order} DESC`;

        logger.debug(query);

        pool = await maria.getPool();
        // [START cloud_sql_mysql_mysql_connection]
        try {
            let rows = await pool.query(query);
            res.send(rows); // rows 를 보내주자
        } catch (err) {
            // If something goes wrong, handle the error in this section. This might
            // involve retrying or adjusting parameters depending on the situation.
            // [START_EXCLUDE]
            logger.error(err);
            return res
                .status(500)
                .send('오류 발생')
                .end();
            // [END_EXCLUDE]
        }
    });

    return app;
}