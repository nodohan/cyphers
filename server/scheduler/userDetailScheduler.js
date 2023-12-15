const commonUtil = require('../util/commonUtil');
const myConfig = require('../../config/config.js');
const repository = require('../repository/matchDetailCharRepository');

module.exports = (scheduler, maria, acclogger) => {
  const app = require('express').Router();
  app.use(acclogger());

  const matchDetailCharRepository = new repository(maria);

  app.use(acclogger());
  
  // URL: http://localhost:8080/userDetail/insertUserDetail
  app.get('/insertUserDetail', function(req, res) {
    doDayWork('2023-12-14');
  });


  const doDayWork = async (yyyymmdd) => {
    const result = await matchDetailCharRepository.selectMatchDetailByMatchDateTest(yyyymmdd);  // 그냥 오늘 기준
    //const result = await matchDetailCharRepository.selectMatchDetailByPlayerId('1826e7c7f0becbc1e65ee644c28f0072', 1000);  // 이번시즌 총전적
    //console.log(result);

    const arr = result.map(data => JSON.parse(data.jsonData));

    const playerList = await matchDetailCharRepository.selectLastNickNames();
    const playerMap = new Map();

    // Populating the Map
    playerList.forEach(item => {
        playerMap.set(item.playerId, item.nickname);
    });

    //console.log(playerMap);

    mergeMatchUser(arr, playerMap, '1826e7c7f0becbc1e65ee644c28f0072');
    mergeMatchChar(arr, '1826e7c7f0becbc1e65ee644c28f0072');
  }
  
  const mergeMatchUser = (jsonArr, playerInfos, playerId) => {
    const myTeam = new Map();
    const enemyTeam = new Map();

    jsonArr.forEach(row => {
        if(!(row.teams[0].players.includes(playerId) || row.teams[1].players.includes(playerId))) {
          return ;
        }

        const isWin = row.teams[0].players.includes(playerId);
        const winningTeam = isWin ? row.teams[0].players : row.teams[1].players;        
        
        row.players.forEach(player => {
            if(playerId == player.playerId) {
              return ;
            }

            const youWin = winningTeam.includes(player.playerId);
            const isMyTeam = !(youWin !== isWin);

            if(isMyTeam) {
                setMap(myTeam, isWin, player.playerId);
            } else {
                setMap(enemyTeam, isWin, player.playerId);
            }
        });
    });

    mappingNickname(playerInfos, myTeam);
    mappingNickname(playerInfos, enemyTeam);

    const result =  {
        myTeam : Object.fromEntries(myTeam), 
        enemyTeam : Object.fromEntries(enemyTeam)
    }

    logger.debug(JSON.stringify(result));
    return result;
  };


  const mergeMatchChar = (jsonArr, userId) => {
    const myTeam = new Map();
    const enemyTeam = new Map();

    jsonArr.forEach(row => {
        const isWin = row.teams[0].players.includes(userId);
        const winningTeam = isWin ? row.teams[0].players : row.teams[1].players;        
        
        row.players.forEach(player => {
            if(userId == player.playerId) {
              return ;
            }
            const youWin = winningTeam.includes(player.playerId);
            const isMyTeam = !(youWin !== isWin);

            if(isMyTeam) {
                setMap(myTeam, isWin, player.playInfo.characterName);
            } else {
                setMap(enemyTeam, isWin, player.playInfo.characterName);
            }
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
      console.log(key, row);
      row.nickname = playerInfos.get(key);
    });
  }

  return app;
}



