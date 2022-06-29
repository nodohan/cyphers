const logger = require('../../config/winston');
const commonUtil = require('../util/commonUtil');
const api = require('../../api');

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

        let playerId = await new api().getPlayerIdByName(req.query.nickname);
        let userNicknameList;
        logger.debug("playerId get %s", playerId);
        if (playerId != null) {
            userNicknameList = await searchNicknameByPlayerId(playerId);
        } else {
            userNicknameList = await searchNickname(userName);
        }

        if (userNicknameList == null || userNicknameList.length == 0) {
            res.send({ resultCode: -1 });
            return;
        }

        if (userNicknameList[0].privateYn == 'Y') {
            res.send({ resultCode: -2 });
            return;
        }

        let result = userNicknameList.map(row => {
            return [row.nickname, row.checkingDate]; // 닉네임, 수집일
        });

        res.send(result);
    });

    async function insertSearchNickname(username) {

    }

    async function searchNicknameByPlayerId(playerId) {
        let query = `SELECT IF(privateYn = 'N', nickname, '비공개') nickname `;
        query += `, DATE_FORMAT(STR_TO_DATE(checkingDate, '%Y%m%d'),'%Y-%m-%d ') checkingDate `;
        query += ` FROM nickNames nick `;
        query += ` WHERE nick.playerId = '${playerId}' ORDER BY checkingDate DESC; `;

        //logger.debug("쿼리: %s", query);

        pool = await maria.getPool();
        try {
            return await pool.query(query);
        } catch (err) {
            logger.error(err);
        }
        return null;
    }


    async function searchNickname(userName) {
        let query = "SELECT IF(privateYn = 'N', nickname, '비공개') nickname ";
        query += ", DATE_FORMAT(STR_TO_DATE(checkingDate, '%Y%m%d'),'%Y-%m-%d ') checkingDate ";
        query += " FROM nickNames nick ";
        query += " WHERE nick.playerId = (  ";
        query += `     SELECT distinct playerId `
        query += `     FROM nickNames WHERE nickname = '${userName}' and privateYn = 'N' `;
        query += `     order by checkingDate desc`
        query += ") ORDER BY checkingDate DESC; ";

        logger.debug("닉변검색: " + userName);
        //logger.debug("쿼리: %s", query);

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