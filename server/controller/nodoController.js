const commonUtil = require('../util/commonUtil');
const api = require('../util/api');

module.exports = (scheduler, maria, acclogger) => {
    const app = require('express').Router();
    app.use(acclogger());

    app.get('/manage', function(req, res) {
        if(!commonUtil.isMe(req)) {
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
        if(!commonUtil.isMe(req)) {
            return res.send({ "resultCode" : "400" ,  "resultMsg" : "내가 아닌데??"});
        }

        const nickname = req.query.nickname;
        if(nickname == null || nickname == "") {
            return res.send({ "resultCode" : "400", "resultMsg" : "검색명 누락"});
        }

        // 1. 닉네임기준으로 유저 api조회 
        // 2. 조회된 유저id를 기준으로 nickname db 조회
        let playerId;
        
        try {
            playerId = await new api().getPlayerIdByName(nickname);
            if(playerId == null) {
                res.send({ "resultCode" : "400", "resultMsg" : "그런인간없음"});
                return ;
            }    
        } catch(err) {
            console.log(err);
        }

        const query = 
            ` SELECT 
                playerId, nickname, checkingDate, season, privateYn, privateDate 
              FROM nickNames 
              where playerId = '${playerId}' 
              order by checkingDate desc `;

        const result =  await maria.doQuery(query);
        //logger.debug(query);
        res.send({ "resultCode" : 200, "resultMsg" : "성공" , "row" : result});
    });

    app.get('/hiddenNickName', async function(req, res) {
        // 나님 체크 
        if(!commonUtil.isMe(req)) {
            res.send({ "resultMsg" : "내가 아닌데??"});
            return ;
        }

        const playerId = req.query.playerId;
        const reason = req.query.reason;
        const todayYYYYMMDD = commonUtil.getYYYYMMDD(new Date(),true);
        const updateNickName = 
            ` update nickNames
              set
                privateYn = 'Y'
                privateDate = '${todayYYYYMMDD}' 
              where playerId = '${playerId}'
              and privateYn = 'N' `;

        const result = await maria.doQuery(updateNickName);
        if(result == -1){
            res.send({ "resultMsg" : "처리실패", "resultCode" : 500});
            return ;
        }
 
        const updatePlayer = 
            ` update nickNames
              set
                privateYn = 'Y'
                comment = '${reason}' 
              where playerId = '${playerId}' `;
        
        result = await maria.doQuery(updatePlayer);

        let resultCode = 200;
        let resultMsg = "성공";
        if(result == -1) {
            resultCode = 500;
            resultMsg = "오류발생 "; 
        } 
        res.send( { "resultCode" : resultCode, "resultMsg" : resultMsg} );
    });

    return app;
}