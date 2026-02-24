const commonUtil = require('../util/commonUtil');
const RankChartService = require('../service/rankChartService');
const logger = require('../../config/winston');

module.exports = (scheduler, maria, acclogger) => {
    const app = require('express').Router();
    app.use(acclogger());

    const rankChartService = new RankChartService(maria);

    // URL: /rankChart/userChart
    app.get('/userChart', function(req, res) {
        commonUtil.getIp(req);
        res.render('./pc/userChart');
    });

    // /rankChart/chartDate
    app.get('/chartDate', async function(req, res) {
        try {
            const result = await rankChartService.getChartDates(req.query.season);
            if (result === null) {
                return res.send({ resultCode: -1 });
            }
            res.send(result);
        } catch (err) {
            logger.error(err);
            return res.status(500).send({ "resultCode": "500", "resultMsg": "Internal Server Error" });
        }
    });

    // /rankChart/userRank
    app.get('/userRank', async function(req, res) {
        const { nickname, season, dayType } = req.query;

        try {
            const result = await rankChartService.getUserRank(nickname, season, dayType);
            if (result === null) {
                return res.send({ resultCode: -1 });
            }
            res.send(result);
        } catch(err) {
            logger.error(err);
            return res.status(500).send({ "resultCode": "500", "resultMsg": "Internal Server Error" });
        } 
    });

    return app;
}