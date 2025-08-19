const commonUtil = require('../util/commonUtil');
const myConfig = require('../../config/config.js');
const service = require('../service/CharRatingStatsService.js');
const api = require('../util/api');

//캐릭 랭킹
module.exports = (scheduler, maria, acclogger) => {
  const app = require('express').Router();
  app.use(acclogger());

  const charRatingStatsService = new service(maria);

  app.use(acclogger());

  var time = "30 01 * * *"; // 리얼용
  scheduler.scheduleJob(time, async function() {
      if (myConfig.schedulerRun) {
        logger.info("call char Rating scheduler");
        await charRatingStatsService.charRanking(); //
      }
  });

  //  url = "/userDetail/userCounter"
  app.get('/userCounter', function(req, res) {
    commonUtil.getIp(req);
    if (commonUtil.isMobile(req)) {
        res.render('./mobile/userCounter');
    } else {
        res.render('./pc/userCounter');
    }
  });
  

  return app;
}