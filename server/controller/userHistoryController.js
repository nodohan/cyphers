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

        /* 랭킹차트로 누른 검색은 이력으로 쌓지 않고
          , 존재하지 않는 사용자는 수집하지 않도록 수정 */
        if(req.query.byRank != 'Y') {
            insertSearchNickname(userName);
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
        try {
            pool = await maria.getPool();
            let query = `insert into nickNameSearch ( searchDate, nickname ) values ( now(), '${username}' ) `;
            logger.debug(query);
            await pool.query(query);
        } catch (err) {
            logger.error(err);
        }
        return;
    }

    // 사용자 닉변 이력 조회 (playerId 기준)
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


    // 사용자 닉변 검색 순위
    app.get('/getUserSearchRank', async function(req, res) {
        let day = new Date();
        let startDate = commonUtil.getYYYYMMDD(commonUtil.setEndDay(commonUtil.addDays(day, -4)), false);
        let endDate = commonUtil.getYYYYMMDD(commonUtil.setEndDay(commonUtil.addDays(day, -1)), false);

        let query = ` SELECT * FROM ( ` +
            ` 	SELECT nickname, COUNT(nickname) cnt ` +
            ` 	FROM nickNameSearch  ` +
            ` 	WHERE searchDate BETWEEN '${startDate}' AND '${endDate}' ` +
            ` 	GROUP BY nickname ` +
            ` ) aa  ` +
            ` ORDER BY cnt DESC  ` +
            ` LIMIT 15  `;
        //logger.debug(query);

        pool = await maria.getPool();
        try {
            let rows = await pool.query(query);

            if (rows == null) {
                res.send({ resultCode: -1 });
                return;
            }

            let result = {};
            result.startDate = startDate;
            result.endDate = endDate;
            result.rows = rows;

            res.send(result);
        } catch (err) {
            logger.error(err);
            return res
                .status(500)
                .send('오류 발생')
                .end();
            // [END_EXCLUDE]
        }

    });

    // 사용자 닉변 이력 조회 (닉네임 기준)
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