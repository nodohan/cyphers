const commonUtil = require('../util/commonUtil');
const myConfig = require('../../config/config.js');
const service = require('../service/CharCombiStatsService');

//캐릭 조합
module.exports = (scheduler, maria, acclogger) => {
    const app = require('express').Router();
    app.use(acclogger());

    const charCombiStatsService = new service(maria);

    //스케쥴러 또는 웹 url call
    var time = "00 02 * * *"; // 리얼용
    scheduler.scheduleJob(time, async function() {
        if (myConfig.schedulerRun) {
            logger.info("call match stats");
            await charCombiStatsService.callCombiData(new Date());
            await charCombiStatsService.callInsertStats(new Date());
            logger.info("end match stats");
        }
    });

    //test  ( "/combiSche/insertStats" )
    app.get('/insertStats', async function(req, res) {
        if (!commonUtil.isMe(req)) {
            return res.send({ "resultCode": "400", "resultMsg": "내가 아닌데??" });
        }
        
        try {
            await charCombiStatsService.callCombiData(new Date());
            await charCombiStatsService.callInsertStats(new Date());
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




