const commonUtil = require('../util/commonUtil');
const api = require('../util/api');

// nodo
module.exports = (scheduler, maria, acclogger) => {
    const app = require('express').Router();
    app.use(acclogger());

    app.get('/manage', function(req, res) {
        if (!commonUtil.isMe(req)) {
            res.redirect("/");
        }

        if (commonUtil.isMobile(req)) {
            res.render('./mobile/manage');
        } else {
            res.render('./pc/manage');
        }
    });

    app.get('/userNickname', async function(req, res) {
        // 나님 체크 
        if (!commonUtil.isMe(req)) {
            return res.send({ "resultCode": "400", "resultMsg": "내가 아닌데??" });
        }

        const nickname = req.query.nickname;
        if (nickname == null || nickname == "") {
            return res.send({ "resultCode": "400", "resultMsg": "검색명 누락" });
        }

        // 1. 닉네임기준으로 유저 api조회 
        // 2. 조회된 유저id를 기준으로 nickname db 조회
        let playerId;

        try {
            playerId = await new api().getPlayerIdByName(nickname);
            if (playerId == null) {
                res.send({ "resultCode": "400", "resultMsg": "그런인간없음" });
                return;
            }
        } catch (err) {
            console.log(err);
        }

        const query =
            ` SELECT 
                playerId, nickname, checkingDate, season, privateYn, privateDate 
              FROM nickNames 
              where playerId = '${playerId}' 
              order by checkingDate desc `;

        const result = await maria.doQuery(query);
        //logger.debug(query);
        res.send({ "resultCode": 200, "resultMsg": "성공", "row": result });
    });



    /**
     * @swagger
     * /nodo/hiddenNickName:
     *   post:
     *    summary: "특정 닉네임 숨김처리"
     *    description: "요청 경로에 값을 담아 서버에 보낸다."
     *    tags: [Users]
     *    parameters:
     *      - in: query
     *        name: user_id
     *        required: true
     *        description: 유저 아이디
     *        schema:
     *          type: string
     *    responses:
     *      "200":
     *        description: 오늘 비공개 처리에 성공한 사용자 닉네임 목록을 콤마(,)로 구분해서 리턴함
     *        content:
     *          application/json:
     *            schema:
     *              type: object
     *              properties:
     *                resultCode:
     *                  type: int
     *                  example: 200
     *                resultMsg:
     *                  type: object
     *                  example : "마을주민1, 상아"
     */
    app.get('/hiddenNickName', async function(req, res) {
        // 나님 체크 
        if (!commonUtil.isMe(req)) {
            res.send({ "resultMsg": "내가 아닌데??" });
            return;
        }
        let resultCode = 200;
        const playerId = req.query.playerId;
        const reason = req.query.reason;
        const addNickName = req.query.addNickname;
        const todayYYYYMMDD = commonUtil.getYYYYMMDD(new Date(), true);

        // 1. 닉네임 비공개 처리
        let updateNickNameResult = await updateNickNameHiddenFunc(playerId, todayYYYYMMDD);
        if (updateNickNameResult == -1) {
            res.send({ "resultMsg": "처리실패", "resultCode": 500 });
            return;
        }

        // 2. 금일 또는 조만간 비공개할 닉네임
        if (addNickName != null) {
            let addNicknameResult = await addNickNameFunc(playerId, addNickName, todayYYYYMMDD);
            if (addNicknameResult == -1) {
                snedResult(res, 500, "오류발생");
                return;
            }
        }

        // 3. player 테이블 업데이트 
        let updatePlayerResult = await updatePlayerFunc(playerId, reason);
        if (updatePlayerResult == -1) {
            snedResult(res, 500, "오류발생");
            return;
        }

        let todayHiddenNickNames = await selectTodayHiddenNicknames(playerId, todayYYYYMMDD);

        res.send({ "resultCode": resultCode, "resultMsg": todayHiddenNickNames });
    });


    selectTodayHiddenNicknames = async(playerId) => {
        const query = `        
            SELECT 
                GROUP_CONCAT(nickname ORDER BY checkingDate DESC ) nicks
            FROM nickNames 
            WHERE privateYn = 'Y'
            AND privateDate = DATE_FORMAT(NOW(), '%y-%m-%d')
            AND playerId = '${playerId}' `;
        return await maria.doQuery(query);
    }

    updateNickNameHiddenFunc = async(playerId, todayYYYYMMDD) => {
        const updateNickNameQuery = ` 
            update nickNames
            set
                privateYn = 'Y'
                privateDate = '${todayYYYYMMDD}' 
            where playerId = '${playerId}'
            and privateYn = 'N' `;

        return await maria.doQuery(updateNickNameQuery);
    }

    addNickNameFunc = async(playerId, addNickname, todayYYYYMMDD) => {
        const addNickNameQuery = ` 
            insert into nickNames 
                (playerId, nickname , checkingDate, season, privateYn, privateDate)
            values 
                ('${playerId}', '${addNickname}', '${todayYYYYMMDD}', '2023H', 'Y', now()) `;

        return await maria.doQuery(addNickNameQuery);
    }

    updatePlayerFunc = async(playerId, reason) => {
        const updatePlayerQuery = ` 
            update nickNames
            set
                privateYn = 'Y'
                comment = '${reason}' 
            where playerId = '${playerId}' `;

        return await maria.doQuery(updatePlayerQuery);
    }

    snedResult = (res, resultCode, resultMsg) => {
        res.send({ "resultCode": resultCode, "resultMsg": resultMsg });
    }

    return app;
}