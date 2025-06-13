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

        try {
            let query = ` SELECT dates, COUNT(dates) cnt FROM ( 
             	SELECT DATE_FORMAT(matchDate, '%Y-%m-%d (%W)') dates, matchId FROM matches 
             ) aa  
             GROUP BY dates 
             ORDER BY dates DESC 
             LIMIT 30 `;

            let row = await maria.doQuery({ bigNumberStrings: true, sql: query });
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

        try {
            let query = ` SELECT * FROM match_stats WHERE statsDate = ? `;
            logger.debug(query);

            let row = await maria.doQuery(query, [todayStr]);
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
        res.render('./pc/statsSeason', { 'season': '2022H' });
    });

    app.get('/stats2022u', function(req, res) {
        res.render('./pc/statsSeason', { 'season': '2022U' });
    });

    app.get('/stats2023h', function(req, res) {
        res.render('./pc/statsSeason', { 'season': '2023H' });
    });

    app.get('/stats2023u', function(req, res) {
        res.render('./pc/statsSeason', { 'season': '2023U' });
    });

    app.get('/stats2024h', function(req, res) {
        res.render('./pc/statsSeason', { 'season': '2024H' });
    });

    app.get('/stats2024u', function(req, res) {
        res.render('./pc/statsSeason', { 'season': '2024U' });
    });


    app.get('/statsSeasonList', async function(req, res) {
        let season = req.query.season

        try {
            let query = ` SELECT * FROM match_stats WHERE statsDate = '${season}' `;
            logger.debug(query);

            let row = await maria.doQuery(query);
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
            season = '2023U';
        }

        try {
            let query = ` SELECT * FROM char_stats where season = '${season}' ORDER BY rate DESC `;
            logger.debug(query);

            let row = await maria.doQuery(query);
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