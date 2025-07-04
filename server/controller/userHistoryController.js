const commonUtil = require('../util/commonUtil');
const api = require('../util/api');

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

        const ip = commonUtil.getIp(req);
        console.log(ip);

        let playerId = await new api().getPlayerIdByName(userName);
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
        if (req.query.byRank != 'Y') {
            insertSearchNickname(userName, ip);
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

    async function insertSearchNickname(username, ip) {
        try {
            let query = `insert into nickNameSearch ( searchDate, nickname, ip ) values ( now(), '${username}', '${ip}' ) `;
            logger.debug(query);
            await maria.doQuery(query);
        } catch (err) {
            logger.error(err);
        }
        return;
    }

    // 사용자 닉변 이력 조회 (playerId 기준)
    async function searchNicknameByPlayerId(playerId) {
        let query = `SELECT 
                        IF(privateYn = 'N', nickname, '비공개') nickname 
                        , DATE_FORMAT(STR_TO_DATE(checkingDate, '%Y%m%d'),'%Y-%m-%d ') checkingDate 
                     FROM nickNames nick 
                     WHERE nick.playerId = '${playerId}' 
                     and checkingDate >= (NOW() - INTERVAL 1 YEAR)
                     ORDER BY checkingDate DESC; `;

        let query2 = `SELECT 
                        IF(privateYn = 'N', nickname, '비공개') nickname 
                        , DATE_FORMAT(STR_TO_DATE(checkingDate, '%Y%m%d'),'%Y-%m-%d ') checkingDate 
                    FROM nickNames nick 
                    WHERE nick.playerId = '${playerId}' 
                    ORDER BY checkingDate DESC 
                    limit 1; `;

        try {
            let result = await maria.doQuery(query);
            if(result.length != 0) {
                return result;
            } 
            return await maria.doQuery(query2);
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

        let query =`SELECT *
                    FROM (
                        SELECT 
                            nickname, COUNT(nickname) AS cnt
                        FROM (
                            SELECT DISTINCT 
                                nickname, 
                                ip, 
                                DATE(searchDate) AS search_date
                            FROM nickNameSearch
                            WHERE searchDate BETWEEN '${startDate}' AND '${endDate}'
                        ) AS distinct_searches
                        GROUP BY nickname
                    ) AS aa
                    ORDER BY cnt DESC
                    LIMIT 15 `;
        //logger.debug(query);
        
        try {
            let rows = await maria.doQuery(query);

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
        let query = `SELECT 
                        IF(privateYn = 'N', nickname, '비공개') nickname 
                        , DATE_FORMAT(STR_TO_DATE(checkingDate, '%Y%m%d'),'%Y-%m-%d ') checkingDate 
                     FROM nickNames nick 
                     WHERE nick.playerId = (
                        SELECT 
                            distinct playerId
                        FROM nickNames 
                        WHERE nickname = '${userName}' 
                        and privateYn = 'N' 
                        and checkingDate >= (NOW() - INTERVAL 1 YEAR)
                        order by checkingDate desc 
                        limit 1
                    )
                    and checkingDate >= (NOW() - INTERVAL 1 YEAR)
                    ORDER BY checkingDate DESC; `;

        logger.debug("닉변검색: " + userName);
        //logger.debug("쿼리: %s", query);

        try {
            let rows = await maria.doQuery(query);
            return rows;
        } catch (err) {
            logger.error(err);
        }

        return null;
    }

    return app;
}