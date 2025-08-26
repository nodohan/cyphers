const commonUtil = require('../util/commonUtil');
const myConfig = require('../../config/config.js');
const MatchService = require('../service/MatchService.js');

module.exports = (scheduler, maria) => {
    const app = require('express').Router();
    const matchService = new MatchService(maria);

    //스케쥴러 또는 웹 url call
    var time = "30 00 * * *";
    scheduler.scheduleJob(time, async function() {
        if (myConfig.schedulerRun) {
            logger.info("call match rating scheduler");
            await matchService.insertMatches('rating', null, new Date());
            logger.info("end match rating scheduler");

            logger.info("call match rating scheduler");
            await matchService.insertMatches('normal', null, new Date());
            logger.info("end match rating scheduler");
        }
    });

    //test  ( "/matches/insertMatches?matchType=rating&day=2025-06-20" )
    app.get('/insertMatches', function(req, res) {
        if (!commonUtil.isMe(req)) {
            return res.send({ "resultCode": "400", "resultMsg": "내가 아닌데??" });
        }

        const {matchType, day } = req.query;
        return matchService.insertMatches(matchType, res, new Date(day));
    });

    return app;
}