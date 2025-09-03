const commonUtil = require('../util/commonUtil');
const CharRatingStatsService = require('../service/CharRatingStatsService');


module.exports = (acclogger) => {
    const app = require('express').Router();
    const charRatingStatsService = new CharRatingStatsService();

    app.use(acclogger());

    // test : /char/charRankView
    app.get('/charRankView', function(req, res) {
        res.render('./dual/charRankView');
    });

    // test : /char/rank/today
    app.get('/rank/today', async function (req, res) {
        const { type, minNum, maxNum  } = req.query;

        return charRatingStatsService.searchRankingForRating(type, minNum, maxNum);
    });

    return app;
}