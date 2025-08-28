const commonUtil = require('../util/commonUtil');
const myConfig = require('../../config/config');
const MatchService = require('../service/MatchService');
const CharRatingStatsService = require('../service/CharRatingStatsService');
const CharCombiStatsService = require('../service/CharCombiStatsService');
const MatchesMapService = require('../service/MatchesMapService');

module.exports = (scheduler, acclogger) => {
    const app = require('express').Router();        
    app.use(acclogger());
    
    const matchService = new MatchService();
    const charCombiStatsService = new CharCombiStatsService();
    const charRatingStatsService = new CharRatingStatsService();
    const matchesMapService = new MatchesMapService();

    //스케쥴러 또는 웹 url call
    var matchIdTime = "30 00 * * *";
    scheduler.scheduleJob(matchIdTime, async function() {
        if (myConfig.schedulerRun) {
            callMatchIdBatch();
        }
    });

    //스케쥴러 또는 웹 url call
    var StatsTime = "00 02 * * *";
    scheduler.scheduleJob(StatsTime, async function() {
        if (myConfig.schedulerRun) {
            callStatsBatch();
        }
    });

    // 
    callMatchIdBatch = async () => {
        // "30 00 * * *";
        logger.info("call match rating scheduler");
        await matchService.insertMatches('rating', null, new Date());
        logger.info("end match rating scheduler");

        logger.info("call match rating scheduler");
        await matchService.insertMatches('normal', null, new Date());
        logger.info("end match rating scheduler");
    }

    // 2시 이후로 실행해야함..
    callStatsBatch = async () => {        
        logger.info("batch insertMatchMap");
        await matchesMapService.insertMatchMap();

        logger.info("batch charRanking");
        await charRatingStatsService.charRanking(); //
        
        logger.info("batch callCombiData");
        await charCombiStatsService.callCombiData(new Date());

        logger.info("batch callInsertStats");
        await charCombiStatsService.callInsertStats(new Date());
        logger.info("batch end");
    }

    //test  ( "/batch/insertMatches?matchType=rating&day=2025-08-27" )
    app.get('/insertMatches', function(req, res) {
        if (!commonUtil.isMe(req)) {
            return res.send({ "resultCode": "400", "resultMsg": "내가 아닌데??" });
        }

        const {matchType, day } = req.query;
        return matchService.insertMatches(matchType, res, new Date(day));
    });
    

    //test  ( "/batch/insertStats" )
    app.get('/insertStats', async function(req, res) {
        if (!commonUtil.isMe(req)) {
            return res.send({ "resultCode": "400", "resultMsg": "내가 아닌데??" });
        }
        
        try {
            await callStatsBatch();
        } catch (err) {
            logger.error(err);
            res.send(err);
            return ;
        }

        return res
            .status(200)
            .send(true)
            .end();
    });
    

    return app;
}