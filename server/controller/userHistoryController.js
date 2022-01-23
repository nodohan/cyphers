const commonUtil = require('../util/commonUtil');

module.exports = (scheduler, maria, acclogger) => {
    const app = require('express').Router();
    app.use(acclogger());

    app.get('/nicknameHistory', function(req, res) {
        if (commonUtil.isMobile(req)) {
            res.render('./mobile/userHistory');
        } else {
            res.render('./pc/userHistory');
        }
    });

    app.get('/searchNicknameHistory', async function(req, res) {
        let userName = req.query.nickname;
        let userNicknameList = await searchNickname(userName);

        if (userNicknameList == null) {
            res.send({ resultCode: -1 });
            return;
        }

        let result = userNicknameList.map(row => {
            // 닉네임, 수집일
            return [row.nickname, row.checkingDate]
        });

        res.send(result);
    });

    async function searchNickname(userName) {
        let query = "SELECT season, nickname, DATE_FORMAT(STR_TO_DATE(checkingDate, '%Y%m%d'),'%Y-%m-%d ') checkingDate "
        query += " FROM nickNames nick "
        query += " LEFT JOIN player pl ON pl.playerId = nick.playerId  "
        query += " WHERE nick.playerId = (  "
        query += "     SELECT playerId FROM nickNames WHERE nickname = '" + userName + "' ";
        query += " ) and ( pl.privateYn IS NULL OR pl.privateYn != 'Y' ) "
        query += " ORDER BY checkingDate DESC; ";

        logger.debug("닉변검색: " + userName);

        let pool = await maria.getPool();

        try {
            let rows = await pool.query(query);
            return rows;
        } catch (err) {
            logger.error(err);
        }

        return null;
    }

    return app;
}