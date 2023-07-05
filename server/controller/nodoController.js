const commonUtil = require('../util/commonUtil');
const api = require('../util/api');
const repository = require('../repository/nodoRepository');

// nodo
module.exports = (scheduler, maria, acclogger) => {
    const app = require('express').Router();
    const nodoRepository = new repository(maria);

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
        // 2. 저장된 닉네임 리스트 조회 by playerId
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
        let updateNickNameResult = await nodoRepository.updateNickNameHiddenFunc(playerId, todayYYYYMMDD);
        if (updateNickNameResult == -1) {
            res.send({ "resultMsg": "처리실패", "resultCode": 500 });
            return;
        }

        // 2. 금일 또는 조만간 비공개할 닉네임
        if (addNickName != null && addNickName != '') {
            let addNicknameResult = await nodoRepository.addNickNameFunc(playerId, addNickName, todayYYYYMMDD);
            if (addNicknameResult == -1) {
                snedResult(res, 500, "오류발생");
                return;
            }
        }

        // 3. player 테이블 업데이트 
        let updatePlayerResult = await nodoRepository.updatePlayerFunc(playerId, reason);
        if (updatePlayerResult == -1) {
            snedResult(res, 500, "오류발생");
            return;
        }

        let todayHiddenNickNames = await nodoRepository.selectTodayHiddenNicknames(playerId, todayYYYYMMDD);

        res.send({ "resultCode": resultCode, "resultMsg": todayHiddenNickNames });
    });


    snedResult = (res, resultCode, resultMsg) => {
        res.send({ "resultCode": resultCode, "resultMsg": resultMsg });
    }

    return app;
}