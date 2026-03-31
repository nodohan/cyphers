const commonUtil = require('../util/commonUtil');

module.exports = (scheduler, maria, acclogger) => {
    const app = require('express').Router();

    app.use(acclogger());

    app.get('/app', function(req, res) {
        res.cookie('doseh_app', 'true', {
            maxAge: 1000 * 60 * 60 * 24 * 365,
            httpOnly: true,
            sameSite: 'lax'
        });
        res.redirect("/user/userSearch?isApp=true");
        //res.render('./mobile/invalid');
    });

    app.get('/invalid', function(req, res) {
        res.render('./mobile/invalid');
    });   

    return app;
}
