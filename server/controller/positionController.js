const commonUtil = require('../util/commonUtil');
const repository = require('../repository/positionRepository');

//특성 통계 
module.exports = (scheduler, maria, acclogger) => {
    const app = require('express').Router();
    app.use(acclogger());
    const positionRepository = new repository(maria);

    app.get('/positionAttr', function(req, res) {
        // if (commonUtil.isMobile(req)) {
        //     res.render('../mobile/positionAttr');
        // } else {
        //     res.render('../pc/positionAttr');
        // }
        res.render('./pc/positionAttr');
    });

    app.get('/positionAttrList', async function(req, res) {
        let today = new Date();
        let addDays = today.getHours() > 4 ? 0 : -1;
        let todayStr = commonUtil.getYYYYMMDD(commonUtil.addDays(today, addDays), false);
        const { charName = 'all' } = req.query;
        const result = await positionRepository.selectPositionAttrList(todayStr, charName);
        res.send({ 'rows': result });
    });

    return app;
}