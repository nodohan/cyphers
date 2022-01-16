const logger = require('../config/winston');
const commonUtil = require('../controller/commonUtil');

module.exports = (scheduler, maria, logger) => {
    const app = require('express').Router();
    app.use(logger());

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
        }

        let result = userNicknameList.map(row => {
            // 닉네임, 수집일
            return [row.nickname, row.checkingDate]
        });

        res.send(result);
    });

    async function searchNickname(userName) {
        let query = "SELECT season, nickname, DATE_FORMAT(STR_TO_DATE(checkingDate, '%Y%m%d'),'%Y-%m-%d ') checkingDate "
        query += " FROM nickNames "
        query += " WHERE playerId = (  "
        query += "     SELECT playerId FROM nickNames WHERE nickname = '" + userName + "' ";
        query += " ) ORDER BY checkingDate DESC; ";

        let pool = await maria.getPool();

        try {
            let rows = await pool.query(query);
            return rows;
        } catch (err) {
            logger.error(err);
            if (res) {
                return res
                    .status(500)
                    .send('오류 발생')
                    .end();
            }
        }

        return null;
    }

    return app;
}