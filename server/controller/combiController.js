const commonUtil = require('../util/commonUtil');
const repository = require('../repository/combiRepository');

// 
module.exports = (scheduler, maria, acclogger) => {
    const app = require('express').Router();
    const combiRepository = new repository(maria);

    app.use(acclogger());

    app.get('/combi', function(req, res) {
        if (commonUtil.isMobile(req)) {
            res.render('./mobile/combi');
        } else {
            res.render('./pc/combi');
        }
    });

    app.get('/combiTotalCount', async function(req, res) {
        res.send({ 'totalCount': combiRepository.combiTotalCount() })        
    });

    app.get('/combiSearch', async function (req, res) {
        const { position, count = 10, order, fromDt, toDt, charName } = req.query;
        const orderType = order === 'count' ? 'total' : 'late';

        return combiRepository.combiSearch(position, count, orderType, fromDt, toDt, charName);
    });

    return app;
}