const logger = require('../../config/winston');
const commonUtil = require('../util/commonUtil');
const api = require('../../api');

module.exports = (scheduler, maria, acclogger) => {
    const app = require('express').Router();
    app.use(acclogger());

    //  url = "/user/userSearch"
    app.get('/userSearch', function(req, res) {
        commonUtil.getIp(req);
        if (commonUtil.isMobile(req)) {
            res.render('./mobile/userSearch', { 'searchNickname': req.query.nickname });
        } else {
            res.render('./pc/userSearch', { 'searchNickname': req.query.nickname });
        }
    });

    //  url = "/user/userSearch_vertical"
    app.get('/userSearch_vertical', function(req, res) {
        //모바일은 지원하지 않음
        commonUtil.getIp(req);
        res.render('./pc/userSearch_vertical', { 'searchNickname': req.query.nickname });
    });

    //  url = "/user/userDetail"
    app.get('/userDetail', function(req, res) {
        commonUtil.getIp(req);

        if (commonUtil.isMobile(req)) {
            res.render('./mobile/userDetail', { 'searchNickname': req.query.nickname });
        } else {
            res.render('./pc/userDetail', { 'searchNickname': req.query.nickname });
        }
    });

    //  url = "/user/userVs"
    app.get('/userVs', function(req, res) {
        commonUtil.getIp(req);

        if (commonUtil.isMobile(req)) {
            res.render('./mobile/userVs');
        } else {
            res.render('./pc/userVs');
        }
    });

    //  url = "/user/getUserInfo"    
    app.get('/getUserInfo', async function(req, res) {
        res.send(await new api().searchUser(req.query.nickname, req.query.gameType));
    });

    //  url = "/user/getMatchInfo"    
    app.get('/getMatchInfo', async function(req, res) {
        res.send(await new api().searchMatchInfo(req.query.matchId));
    });

    //  url = "/user/getNicknameHistory"    
    app.get('/getNicknameHistory', async function(req, res) {
        let playerId = req.query.playerId;
        let query =
            ` SELECT ` +
            `   season, checkingDate ` +
            ` 	,IF(privateYn = 'N', nickname, '비공개') nickname ` +
            ` FROM nickNames ` +
            ` WHERE playerId = '${playerId}' ` +
            ` ORDER BY checkingDate DESC `;

        //logger.debug("%s", query);

        pool = await maria.getPool();
        // [START cloud_sql_mysql_mysql_connection]
        try {
            let rows = await pool.query(query);

            if (rows == null) {
                res.send({ resultCode: -1 });
                return;
            }
            res.send(rows); // rows 를 보내주자
        } catch (err) {
            // If something goes wrong, handle the error in this section. This might
            // involve retrying or adjusting parameters depending on the situation.
            // [START_EXCLUDE]
            logger.error(err);
            return res
                .status(500)
                .send('오류 발생')
                .end();
            // [END_EXCLUDE]
        }
    });

    //  url = "/user/getUserSeasonRank"    
    app.get('/getUserSeasonRank', async function(req, res) {
        let playerId = req.query.playerId;
        if (playerId == null || playerId == '') {
            res.send({ resultCode: -1 });
            return;
        }

        let query = ` SELECT * FROM rank WHERE rankDate = '2022-02-17' AND playerId = '${playerId}' `;
        pool = await maria.getPool();
        try {
            let rows = await pool.query(query);

            if (rows == null) {
                res.send({ resultCode: -1 });
                return;
            }
            res.send(rows); // rows 를 보내주자
        } catch (err) {
            logger.error(err);
            return res
                .status(500)
                .send('오류 발생')
                .end();
            // [END_EXCLUDE]
        }
    });

    return app;
}