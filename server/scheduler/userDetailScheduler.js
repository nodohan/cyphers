const commonUtil = require('../util/commonUtil');
const myConfig = require('../../config/config.js');
const repository = require('../repository/matchDetailCharRepository');
const api = require('../util/api');

module.exports = (scheduler, maria, acclogger) => {
  const app = require('express').Router();
  app.use(acclogger());

  const matchDetailCharRepository = new repository(maria);

  app.use(acclogger());

  var time = "* * * * *"; // production
  scheduler.scheduleJob(time, async function() {
      if (myConfig.schedulerRun) {

        logger.info("call userDetail scheduler");
        // Run only when another detail collection is not already active.
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
          await matchDetailCharRepository.updateUserDetailState('running', playerId);
          let data = await doDayWork(playerId);
          await matchDetailCharRepository.updateUserDetail('complate', playerId, data);
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
      res.send({ "resultMsg": "그런 유저가 없습니다.", "resultCode": 400 });
      return ;
    }

    const state = await reserve(playerId);
    let resultMsg = "접수되었습니다.";
    switch(state) {
      case "insert" : resultMsg = "접수되었습니다."; break;
      case "reserve" : resultMsg = "대기중입니다."; break;
      case "running" : resultMsg = "분석중입니다."; break;
      case "complate" : resultMsg = "완료상태입니다."; break;
    }  
    
    res.send({ "resultMsg": resultMsg, "resultCode": 200 });
  });

  // URL: http://localhost:8080/userDetail/selectUserDetail
  app.get('/selectUserDetail', async function(req, res) {
    const playerId = await getPlayerIdByName(req.query.nickname);
    if(playerId == null) {
      res.send({ "resultMsg": "그런 유저가 없습니다.", "resultCode": 400 });
      return ;
    }
    
    const result = await matchDetailCharRepository.selectDetail(playerId);
    res.send({ "resultMsg": "조회 성공", "resultCode": 200, "nickname" : req.query.nickname,  "rows" : result });
  });

  const reserve = async (playerId) =>  {
    const detail = await matchDetailCharRepository.selectDetail(playerId);
    if(detail.length == 0) {
      await matchDetailCharRepository.insertUserDetail(playerId);
      return "insert";
    } else {
      await matchDetailCharRepository.updateUserDetailState("reserve", playerId);
      return "update";
    }
    // Reserved for date-based refresh logic if needed later.
    return ;
  }

  const getPlayerIdByName = async (nickname) => {
    // 1. Look up the user in the API by nickname.
    // 2. Resolve the stored nickname list by playerId.
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
    //const result = await matchDetailCharRepository.selectMatchDetailByMatchDateTest(yyyymmdd);
    const result = await matchDetailCharRepository.selectMatchDetailByPlayerId(playerId, 2000);

    const arr = result.map(data => {
      const row = JSON.parse(data.jsonData);
      row.matchId = data.matchId || row.matchId || "";
      row.matchDate = data.matchDate || row.matchDate || "";
      row.date = row.date || data.matchDate || "";
      return row;
    });

    const playerList = await matchDetailCharRepository.selectLastNickNames();
    const playerMap = new Map();

    // Populating the Map
    playerList.forEach(item => {
        playerMap.set(item.playerId, item.nickname);
    });

    const vsUser = mergeMatchUser(arr, playerMap, playerId);
    const vsChar = mergeMatchChar(arr, playerMap, playerId);

    return { vsUser, vsChar} ;
  }
  
  const mergeMatchUser = (jsonArr, playerInfos, playerId) => {
    const myTeam = new Map();
    const enemyTeam = new Map();
    const recentLimit = 5;

    jsonArr.forEach(row => {
      if(!(row.teams[0].players.includes(playerId) || row.teams[1].players.includes(playerId))) {
        return ;
      }

      const isWin = row.teams[0].result == "win" && row.teams[0].players.includes(playerId) || row.teams[1].result == "win" && row.teams[1].players.includes(playerId);
      const myTeamList = row.teams[0].players.includes(playerId) ? row.teams[0].players : row.teams[1].players;
      const me = row.players.find(player => player.playerId == playerId);
      
      row.players.forEach(player => {
          const youId = player.playerId;
          if(playerId == youId) {
            return ;
          }

          const targetMap = myTeamList.includes(youId) ? myTeam : enemyTeam;
          setMap(targetMap, isWin, youId);
          appendRecentMatch(targetMap, youId, {
            matchId: row.matchId,
            date: row.date,
            result: isWin ? "win" : "lose",
            teamType: myTeamList.includes(youId) ? "ally" : "enemy",
            myCharName: me?.playInfo?.characterName || "",
            youCharName: player.playInfo?.characterName || "",
            mapName: player.map?.name || row.map?.name || ""
          }, recentLimit);
      });
    });

    mappingNickname(playerInfos, myTeam);
    mappingNickname(playerInfos, enemyTeam);

    const result =  {
      myTeam : Array.from(myTeam.values()),
      enemyTeam : Array.from(enemyTeam.values())
    }

    logger.debug(JSON.stringify(result));
    return result;
  };

  const mergeMatchChar = (jsonArr, playerInfos, playerId) => {
    const myTeam = new Map();
    const enemyTeam = new Map();

    jsonArr.forEach(row => {
      if(!(row.teams[0].players.includes(playerId) || row.teams[1].players.includes(playerId))) {
        return ;
      }

      const isWin = row.teams[0].result == "win" && row.teams[0].players.includes(playerId) || row.teams[1].result == "win" && row.teams[1].players.includes(playerId);
      const myTeamList = row.teams[0].players.includes(playerId) ? row.teams[0].players : row.teams[1].players;
      const me = row.players.find(player => player.playerId == playerId);
      
      row.players.forEach(player => {
          const youId = player.playerId;
          if(playerId == youId) {
            return ;
          }

          const targetMap = myTeamList.includes(youId) ? myTeam : enemyTeam;
          const charName = player.playInfo.characterName;
          setMap(targetMap, isWin, charName);
          appendCharUser(targetMap, charName, youId, isWin, {
            matchId: row.matchId,
            date: row.date,
            mapName: player.map?.name || row.map?.name || "",
            myCharName: me?.playInfo?.characterName || "",
            youCharName: player.playInfo?.characterName || ""
          });
      });
    });

    sortCharUsers(myTeam);
    sortCharUsers(enemyTeam);
    mappingNickname(playerInfos, myTeam);
    mappingNickname(playerInfos, enemyTeam);

    const result =  {
        myTeam : compactCharTeam(myTeam),
        enemyTeam : compactCharTeam(enemyTeam)
    }

    logger.debug(JSON.stringify(result));
    return result;
  };

  const setMap = (map, isWin, key) => {
    const current = map.get(key) || {};
    map.set(key, {
      ...current,
      win: (current.win || 0) + (isWin ? 1 : 0),
      lose: (current.lose || 0) + (isWin ? 0 : 1),
      matches: current.matches || [],
      users: current.users || [],
    });
  }

  const appendRecentMatch = (map, key, match, recentLimit) => {
    const row = map.get(key);
    if(!row) {
      return ;
    }

    const matches = row.matches || [];
    matches.push(match);
    matches.sort((a, b) => new Date(b.date) - new Date(a.date));
    row.matches = matches.slice(0, recentLimit);
    map.set(key, row);
  }

  const appendCharUser = (map, charName, userId, isWin, matchSummary) => {
    const row = map.get(charName);
    if(!row) {
      return ;
    }

    const users = row.users || [];
    let target = users.find(user => user.playerId == userId);

    if(!target) {
      target = {
        playerId: userId,
        matchId: "",
        win: 0,
        lose: 0,
        date: "",
        mapName: "",
        myCharName: "",
        youCharName: "",
      };
      users.push(target);
    }

    if(isWin) {
      target.win++;
    } else {
      target.lose++;
    }

    if(!target.date || new Date(matchSummary.date) > new Date(target.date)) {
      target.matchId = matchSummary.matchId || "";
      target.date = matchSummary.date || "";
      target.mapName = matchSummary.mapName || "";
      target.myCharName = matchSummary.myCharName || "";
      target.youCharName = matchSummary.youCharName || "";
    }

    row.users = users;
    map.set(charName, row);
  }

  const sortCharUsers = (team) => {
    team.forEach((row, key) => {
      row.users = (row.users || [])
        .sort((a, b) => {
          const totalDiff = (b.win + b.lose) - (a.win + a.lose);
          if(totalDiff != 0) {
            return totalDiff;
          }

          return ((b.win * 100) / (b.win + b.lose)) - ((a.win * 100) / (a.win + a.lose));
        })
        .slice(0, 3);
      team.set(key, row);
    });
  }

  const mappingNickname = (playerInfos, team) => {
    team.forEach((row, key) => {
      if(Array.isArray(row.matches)) {
        row.nickname = playerInfos.get(key);
      }

      if(Array.isArray(row.users)) {
        row.users = (row.users || []).map(user => ({
          win: user.win,
          lose: user.lose,
          nickname: playerInfos.get(user.playerId) || "",
          matchId: user.matchId || "",
          date: user.date || "",
          mapName: user.mapName || "",
          myCharName: user.myCharName || "",
          youCharName: user.youCharName || ""
        }));
      }
    });
  }

  const compactCharTeam = (team) => {
    const result = {};

    team.forEach((row, key) => {
      result[key] = {
        win: row.win || 0,
        lose: row.lose || 0,
        users: (row.users || []).map(user => ({
          win: user.win || 0,
          lose: user.lose || 0,
          nickname: user.nickname || "",
          matchId: user.matchId || "",
          date: user.date || "",
          mapName: user.mapName || "",
          myCharName: user.myCharName || "",
          youCharName: user.youCharName || ""
        }))
      };
    });

    return result;
  }

  return app;
}
