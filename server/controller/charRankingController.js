const commonUtil = require('../util/commonUtil');
const CharRatingStatsService = require('../service/CharRatingStatsService');


module.exports = (acclogger, maria) => {
    const app = require('express').Router();
    const charRatingStatsService = new CharRatingStatsService(maria);

    app.use(acclogger());

    // test : /char/charRankView
    app.get('/charRankView', function(req, res) {
        res.render('./dual/charRankView');
    });

    // test : /char/rank/today
    app.get('/rank/today', async function (req, res) {
        const { type, minNum, maxNum  } = req.query;

        try {
            const result = await charRatingStatsService.searchRankingForRating(type, minNum, maxNum);
            res.json(result);
        } catch (err) {
            logger.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    return app;
}