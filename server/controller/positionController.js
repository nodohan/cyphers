const logger = require('../../config/winston');
const commonUtil = require('../util/commonUtil');

module.exports = (scheduler, maria, acclogger) => {
    const app = require('express').Router();
    app.use(acclogger());

    app.get('/positionAttr', function(req, res) {
        // if (commonUtil.isMobile(req)) {
        //     res.render('../mobile/positionAttr');
        // } else {
        //     res.render('../pc/positionAttr');
        // }
        res.render('./pc/positionAttr');
    });

    app.get('/positionAttrList', async function(req, res) {
        let todayStr = commonUtil.getYYYYMMDD(commonUtil.addDays(new Date(), -1), false);
        let charName = req.query.charName;

        //let todayStr = '2022-09-29';
        pool = await maria.getPool();

        try {
            let query = `select * 
                        from position_attr_stats
                        where checkDate = '${todayStr}'
                        and charName = '${charName == null ? 'all' : charName}' `;
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