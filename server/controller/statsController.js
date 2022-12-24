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
            let query = ` SELECT dates, COUNT(dates) cnt FROM ( 
             	SELECT DATE_FORMAT(matchDate, '%Y-%m-%d (%W)') dates, matchId FROM matches 
             ) aa  
             GROUP BY dates 
             ORDER BY dates DESC 
             LIMIT 30 `;

            let row = await pool.query(query);
            res.send({ 'row': row });
        } catch (err) {
            logger.error(err);
            console.log(err);
            return res
                .status(500)
                .send('오류 발생')
                .end();
        }
    });

    app.get('/statsList', async function(req, res) {
        let todayStr = '';

        if (req.query.season != null) {
            todayStr = req.query.season;
        } else {
            let today = new Date();
            if (today.getHours() <= 2) {
                today = commonUtil.addDays(today, -1);
            }
            todayStr = commonUtil.getYYYYMMDD(today, false);
        }

        pool = await maria.getPool();

        try {
            let query = ` SELECT * FROM match_stats WHERE statsDate = '${todayStr}' `;
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

    app.get('/stats2022h', function(req, res) {
        res.render('./pc/stats2022h');
    });

    app.get('/statsSeasonList', async function(req, res) {
        let season = req.query.season

        pool = await maria.getPool();

        try {
            let query = ` SELECT * FROM match_stats WHERE statsDate = '${season}' `;
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

    app.get('/charList', async function(req, res) {
        let season = req.query.season;
        if (season == null) {
            season = '2022H';
        }

        pool = await maria.getPool();

        try {
            let query = ` SELECT * FROM char_stats where season = '${season}' ORDER BY rate DESC `;
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