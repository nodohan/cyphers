const commonUtil = require('../util/commonUtil');

module.exports = (scheduler, maria, acclogger) => {
    const app = require('express').Router();

    app.use(acclogger());

    app.get('/app', function(req, res) {
        //res.redirect("/user/userSearch?isApp=true");
        res.render('./mobile/invalid');
    });

    app.get('/invalid', function(req, res) {
        res.render('./mobile/invalid');
    });   

    return app;
}