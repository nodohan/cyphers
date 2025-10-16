const commonUtil = require('../util/commonUtil');
const myConfig = require('../../config/config.js');
const MatchesMapService = require('../service/MatchesMapService');

module.exports = (scheduler, maria) => {
    const app = require('express').Router();

    const matchesMapService = new MatchesMapService();
    
    //test  ( "/matchesMap/insertMatchesMap?day=2025-06-10" )
    app.get('/insertMatchesMap', async function(req, res) {
        if (!commonUtil.isMe(req)) {
            return res.send({ "resultCode": "400", "resultMsg": "내가 아닌데??" });
        }

        res.send({ "resultCode": "200", "resultMsg": "내가 맞다" });
        let isRun = true;
        while(isRun) {
            isRun = await matchesMapService.insertMatchMap(req.query.day);
        }
    });

    //test  ( "/matchesMap/updateMatchesMap" )
    app.get('/updateMatchesMap', async function(req, res) {
        if (!commonUtil.isMe(req)) {
            return res.send({ "resultCode": "400", "resultMsg": "내가 아닌데??" });
        }

        res.send({ "resultCode": "200", "resultMsg": "내가 맞다" });
        matchesMapService.updatePositionBatch();
    });

    //test  ( "/matchesMap/getMatchesMap" )
    app.get('/getMatchesMap', async function(req, res) {        
        
        const playerId = req.query.playerId;
        if(playerId == null) {
            res.send({ "resultCode": "400", "resultMsg": "잘못검색함" });
            return ;
        }
        res.send(await matchesMapService.getUserMatchesMap(req.query.playerId));
    });


    //test  ( "/matchesMap/teamRate?playerIds=1826e7c7f0becbc1e65ee644c28f0072&playerIds=b2612be939898da38f08143a09c97412" )
    app.get('/teamRate', async function(req, res) {        
        
        const playerIds = req.query.playerIds;
        if(playerIds == null || playerIds.length == 0) {
            res.send({ "resultCode": "400", "resultMsg": "잘못검색함" });
            return ;
        }
        res.send(await matchesMapService.teamRate(playerIds));
    });

    return app;
}