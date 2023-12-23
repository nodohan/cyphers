const commonUtil = require('../util/commonUtil');
const myConfig = require('../../config/config.js');
const repository = require('../repository/matchDetailCharRepository');

module.exports = (scheduler, maria, acclogger) => {
  const app = require('express').Router();
  app.use(acclogger());

  const matchDetailCharRepository = new repository(maria);

  app.use(acclogger());

  var time = "* * * * *"; // 리얼용
  scheduler.scheduleJob(time, async function() {
      if (myConfig.schedulerRun) {

        const runCount = matchDetailCharRepository.countRunningDetail();
        if(runCount == 0){
          //const playerId = matchDetailCharRepository.getReserveUserFristOne();
          const playerId = '1826e7c7f0becbc1e65ee644c28f0072';
          await matchDetailCharRepository.udpateUserDetailState('running', playerId);
          let data = await doDayWork(playerId);
          await matchDetailCharRepository.udpateUserDetail('complate', playerId, data);
        }
      }
  });
  
  // URL: http://localhost:8080/userDetail/insertUserDetail
  app.get('/insertUserDetail', async function(req, res) {

    const state = await reserve(req.query.nickname);

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
    res.send(await selectDetail(req.query.nickname));
  });

  const reserve = async (nickname) =>  {

  }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
  const doDayWork = async (playerId) => {
    //const result = await matchDetailCharRepository.selectMatchDetailByMatchDateTest(yyyymmdd);  // 그냥 오늘 기준
    const result = await matchDetailCharRepository.selectMatchDetailByPlayerId(playerId, 1000);  // 이번시즌 총전적

    const arr = result.map(data => JSON.parse(data.jsonData));

    const playerList = await matchDetailCharRepository.selectLastNickNames();
    const playerMap = new Map();

    // Populating the Map
    playerList.forEach(item => {
        playerMap.set(item.playerId, item.nickname);
    });

    const vsUser = mergeMatchUser(arr, playerMap, playerId);
    const vsChar = mergeMatchChar(arr, playerId);

    await matchDetailCharRepository.insertUserDetail(vsUser, vsChar);

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



