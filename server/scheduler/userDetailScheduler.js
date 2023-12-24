const commonUtil = require('../util/commonUtil');
const myConfig = require('../../config/config.js');
const repository = require('../repository/matchDetailCharRepository');
const api = require('../util/api');

module.exports = (scheduler, maria, acclogger) => {
  const app = require('express').Router();
  app.use(acclogger());

  const matchDetailCharRepository = new repository(maria);

  app.use(acclogger());

  var time = "* * * * *"; // 리얼용
  scheduler.scheduleJob(time, async function() {
      if (myConfig.schedulerRun) {

        logger.info("call userDetail scheduler");
        //현재 동작하는 detail 수집이 없으면
        const runCount = await matchDetailCharRepository.countRunningDetail();
        if(runCount[0].cnt == 0){
          const detail = await matchDetailCharRepository.getReserveUserFristOne();
          console.log(detail);
          if(detail.length == 0) {
            logger.info("no reserve user end scheduler");
            return ;
          }
          const playerId = detail[0].playerId;

          logger.info("dowork userDetail scheduler %s", playerId);
          await matchDetailCharRepository.udpateUserDetailState('running', playerId); //활성화 후 
          let data = await doDayWork(playerId); // 시작
          await matchDetailCharRepository.udpateUserDetail('complate', playerId, data); // 종료되면 업데이트
        }
      }
  });

  //  url = "/userDetail/userCounter"
  app.get('/userCounter', function(req, res) {
    commonUtil.getIp(req);
    if (commonUtil.isMobile(req)) {
        res.render('./mobile/userCounter');
    } else {
        res.render('./pc/userCounter');
    }
  });
  
  // URL: http://localhost:8080/userDetail/insertUserDetail
  app.get('/insertUserDetail', async function(req, res) {

    const playerId = await getPlayerIdByName(req.query.nickname);
    if(playerId == null) {
      res.send({ "resultMsg": "그런인간없음", "resultCode": 400 });
      return ;
    }

    const state = await reserve(playerId);
    let resultMsg = "접수하였습니다.";
    switch(state) {
      case "insert" : resultMsg = "접수하였습니다.";
      case "reserve" : resultMsg = "대기중입니다.";
      case "running" : resultMsg = "분석중입니다.";
      case "complate" : resultMsg = "완료상태.";
    }  
    
    res.send({ "resultMsg": resultMsg, "resultCode": 200 });
  });

  // URL: http://localhost:8080/userDetail/selectUserDetail
  app.get('/selectUserDetail', async function(req, res) {
    const playerId = await getPlayerIdByName(req.query.nickname);
    if(playerId == null) {
      res.send({ "resultMsg": "그런인간없음", "resultCode": 400 });
      return ;
    }
    
    const result = await matchDetailCharRepository.selectDetail(playerId);
    res.send({ "resultMsg": "조회함2", "resultCode": 200, "rows" : result });
  });

  const reserve = async (playerId) =>  {
    const detail = await matchDetailCharRepository.selectDetail(playerId);
    if(detail.length == 0) {
      await matchDetailCharRepository.insertUserDetail(playerId);
      return "insert";
    } 
    // 오늘이랑 checkDate를 비교해서 다르면 날짜를 update처리하고 
    return ;
  }

  const getPlayerIdByName = async (nickname) => {
    // 1. 닉네임기준으로 유저 api조회 
    // 2. 저장된 닉네임 리스트 조회 by playerId
    let playerId;
    try {
        playerId = await new api().getPlayerIdByName(nickname);
        if (playerId == null) {
            return null;
        }
    } catch (err) {
        console.log(err);
    }
    return playerId;
  } 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
  const doDayWork = async (playerId) => {
    //const result = await matchDetailCharRepository.selectMatchDetailByMatchDateTest(yyyymmdd);  // 그냥 오늘 기준
    const result = await matchDetailCharRepository.selectMatchDetailByPlayerId(playerId, 2000);  // 이번시즌 총전적

    const arr = result.map(data => JSON.parse(data.jsonData));

    const playerList = await matchDetailCharRepository.selectLastNickNames();
    const playerMap = new Map();

    // Populating the Map
    playerList.forEach(item => {
        playerMap.set(item.playerId, item.nickname);
    });

    const vsUser = mergeMatchUser(arr, playerMap, playerId);
    const vsChar = mergeMatchChar(arr, playerId);

    return { vsUser, vsChar} ;
  }
  
  const mergeMatchUser = (jsonArr, playerInfos, playerId) => {
    const myTeam = new Map();
    const enemyTeam = new Map();

    jsonArr.forEach(row => {
      //이겜에 내가 참석했는지 
      if(!(row.teams[0].players.includes(playerId) || row.teams[1].players.includes(playerId))) {
        return ;
      }
      const isWin = row.teams[0].result == "win" &&  row.teams[0].players.includes(playerId) || row.teams[1].result == "win" && row.teams[1].players.includes(playerId);
      const myTeamList = row.teams[0].players.includes(playerId) ? row.teams[0].players : row.teams[1].players;
      
      row.players.forEach(player => {
          const youId = player.playerId;
          if(playerId == youId) {
            return ;
          }
          setMap(myTeamList.includes(youId) ? myTeam : enemyTeam, isWin, youId);          
      });
    });

    mappingNickname(playerInfos, myTeam);
    mappingNickname(playerInfos, enemyTeam);

    const result =  {
      myTeam : Array.from(myTeam.values()) , 
      enemyTeam : Array.from(enemyTeam.values()) 
  }

    logger.debug(JSON.stringify(result));
    return result;
  };

  const mergeMatchChar = (jsonArr, playerId) => {
    const myTeam = new Map();
    const enemyTeam = new Map();

    jsonArr.forEach(row => {
      if(!(row.teams[0].players.includes(playerId) || row.teams[1].players.includes(playerId))) {
        return ;
      }
      const isWin = row.teams[0].result == "win" &&  row.teams[0].players.includes(playerId) || row.teams[1].result == "win" && row.teams[1].players.includes(playerId);
      const myTeamList = row.teams[0].players.includes(playerId) ? row.teams[0].players : row.teams[1].players;
      
      row.players.forEach(player => {
          const youId = player.playerId;
          if(playerId == youId) {
            return ;
          }
          setMap(myTeamList.includes(youId) ? myTeam : enemyTeam, isWin, player.playInfo.characterName);          
      });
    });

    const result =  {
        myTeam : Object.fromEntries(myTeam), 
        enemyTeam : Object.fromEntries(enemyTeam)
    }

    logger.debug(JSON.stringify(result));
    return result;
  };

  const setMap = (map, isWin, key) => {
    if(isWin) {
        map.set(key, {
            win: (map.get(key)?.win || 0) + 1,
            lose: map.get(key)?.lose || 0,
        });
    }else {
        map.set(key, {
            win: map.get(key)?.win || 0,
            lose: (map.get(key)?.lose || 0 ) + 1,
        });
    }
  }

  const mappingNickname = (playerInfos, team) => {
    team.forEach((row, key) => {
      row.nickname = playerInfos.get(key);
    });
  }

  return app;
}



