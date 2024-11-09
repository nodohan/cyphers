const commonUtil = require('../util/commonUtil');
const api = require('../util/api');
const repository = require('../repository/userRepository');

module.exports = (scheduler, maria, acclogger) => {
    const app = require('express').Router();
    app.use(acclogger());
    const userRepository = new repository(maria);

    //  url = "/user/userSearch"
    app.get('/userSearch', function(req, res) {
        commonUtil.getIp(req);
        const isApp = req.query.isApp || false;
        console.log("앱맞음?", isApp);

        if (isApp || commonUtil.isMobile(req)) {
            res.render('./mobile/userSearch', { 'searchNickname': req.query.nickname, 'isApp' : isApp });
        } else {
            res.render('./pc/userSearch', { 'searchNickname': req.query.nickname });
        }
    });

    app.get('/userTest', function(req, res) {
        commonUtil.getIp(req);
        if (commonUtil.isMobile(req)) {
            res.render('./mobile/userTest', { 'searchNickname': req.query.nickname });
        } else {
            res.render('./pc/userTest', { 'searchNickname': req.query.nickname });
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
        const { nickname, gameType} = req.query;
        let userInfo = await new api().searchUser(nickname, gameType);
        if(gameType == 'rating') {
            try {
                let matches = await userRepository.selectUserMatches(userInfo.playerId);
                matches = matches.map(row => JSON.parse(row.jsonData)) || [];
                userInfo.matches.rows.push(... matches);
                let rows = userInfo.matches.rows;
                rows = rows.filter((obj, index, self) => index === self.findIndex((t) => t.matchId === obj.matchId));
                userInfo.matches.rows = rows;
                //const hasMatchIds = userInfo.matches.rows.length != 0 ? userInfo.matches.rows.map(row => "'" +  row.matchId + "'").join(",") : "";
                logger.debug("getUserInfo matchRow: " + rows.length);
            } catch(err) {
                logger.error(err);
            }
        }
            
        res.send(userInfo);
    });


    //  url = "/user/grade"
    app.get('/userInfoSimple', async function(req, res) {
        res.send(await new api().userInfoSimple(req.query.playerId));
    });


    //  url = "/user/getMatchInfo"    
    app.get('/getMatchInfo', async function(req, res) {
        res.send(await new api().searchMatchInfo(req.query.matchId));
    });

    //  url = "/user/getNicknameHistory"    
    app.get('/getNicknameHistory', async function(req, res) {
        let playerId = req.query.playerId;
        let query = `SELECT 
                        season, checkingDate 
                        ,IF(privateYn = 'N', nickname, '비공개') nickname 
                    FROM nickNames 
                    WHERE playerId = '${playerId}' 
                    AND checkingDate >= (NOW() - INTERVAL 1 YEAR)
                    ORDER BY checkingDate DESC `;

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

        let query = `SELECT 
				ur.rankDate, ur.nickname, ur.rp, ur.season 
				, IF(pl.privateYn = 'Y', '몰?루?', ur.rankNumber) rankNumber 
			FROM userRank ur 
			LEFT JOIN player pl ON pl.playerId = ur.playerId 
			WHERE rankDate in ( '2022-02-17', '2022-08-18', '2023-02-23', '2023-09-14', '2024-03-21', '2024-09-26' ) AND pl.playerId = '${playerId}' `;

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