const commonUtil = require('../util/commonUtil');
//const repository = require('../repository/combiRepository');


module.exports = (acclogger) => {
    const app = require('express').Router();
    //const combiRepository = new repository();

    app.use(acclogger());

    // test : /char/charRankView
    app.get('/charRankView', function(req, res) {
        res.render('./dual/charRankView');
    });

    // app.get('/combiSearch', async function (req, res) {
    //     const { position, count = 10, order, fromDt, toDt, charName } = req.query;
    //     const orderType = order === 'count' ? 'total' : 'late';

    //     return combiRepository.combiSearch(position, count, orderType, fromDt, toDt, charName);
    // });

    return app;
}