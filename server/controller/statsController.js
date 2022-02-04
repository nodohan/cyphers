const logger = require('../../config/winston');
const commonUtil = require('../util/commonUtil');

module.exports = (scheduler, maria, acclogger) => {
    const app = require('express').Router();
    app.use(acclogger());

    app.get('/stats', function(req, res) {
        if (commonUtil.isMobile(req)) {
            res.render('../mobile/stats');
        } else {
            res.render('../pc/stats');
        }
    });

    app.get('/statsCountList', async function(req, res) {
        let todayStr = commonUtil.getYYYYMMDD(new Date(), false);
        pool = await maria.getPool();

        try {
            let query = " SELECT dates, COUNT(dates) cnt FROM ( ";
            query += " 	SELECT DATE_FORMAT(matchDate, '%Y-%m-%d') dates, matchId FROM matches ";
            query += " ) aa  ";
            query += " GROUP BY dates ";
            query += " ORDER BY dates DESC ";
            query += " LIMIT 30 ";

            let row = await pool.query(query);
            res.send({ 'row': row });
        } catch (err) {
            logger.error(err);
            return res
                .status(500)
                .send('오류 발생')
                .end();
        }
    });

    app.get('/statsList', async function(req, res) {
        let today = new Date();
        if (today.getHours() <= 2) {
            today = commonUtil.addDays(today, -1);
        }

        let todayStr = commonUtil.getYYYYMMDD(today, false);
        pool = await maria.getPool();

        try {
            let query = " SELECT * FROM match_stats WHERE statsDate = '" + todayStr + "' ";
            logger.debug(query);

            let row = await pool.query(query);
            res.send({ 'row': row });
        } catch (err) {
            logger.error(err);
            return res
                .status(500)
                .send('오류 발생')
                .end();
        }
    });


    return app;
}