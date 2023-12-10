const commonUtil = require('../util/commonUtil');
const myConfig = require('../../config/config.js');
const repository = require('../repository/nodoRepository');
const result = await nodoRepository.selectUserHistory(playerId);


module.exports = (scheduler, maria, acclogger) => {
    const app = require('express').Router();
    app.use(acclogger());

    var data;

    app.get('/insertMatchChar', function(req, res) {
      

    });



        
    const mergeMatchUser = (jsonArr, userId) => {
      const playerCount = new Map();

      jsonArr.forEach(row => {
        const isWin = row.teams[0].players.includes(userId);
        const winningTeam = isWin ? row.teams[0].players : row.teams[1].players;
        const losingTeam = isWin ? row.teams[1].players : row.teams[0].players;

        winningTeam.forEach(player => {
          playerCount.set(player, {
            win: (playerCount.get(player)?.win || 0) + 1,
            lose: playerCount.get(player)?.lose || 0,
          });
        });

        losingTeam.forEach(player => {
          playerCount.set(player, {
            win: playerCount.get(player)?.win || 0,
            lose: (playerCount.get(player)?.lose || 0) + 1,
          });
        });
      });

      console.log(Object.fromEntries(playerCount));
      return Object.fromEntries(playerCount);
    };

    const mergeMatchChar = (jsonArr, userId) => {
    const myTeam = new Map();
    const enemyTeam = new Map();

    jsonArr.forEach(row => {
        const isWin = row.teams[0].players.includes(userId);
        const winningTeam = isWin ? row.teams[0].players : row.teams[1].players;        
        
        row.players.forEach(player => {
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

    console.log(result);
    return result;
    };

    const setMap = (map, isWin, characterName) => {
    if(isWin) {
        map.set(characterName, {
            win: (map.get(characterName)?.win || 0) + 1,
            lose: map.get(characterName)?.lose || 0,
        });
    }else {
        map.set(characterName, {
            win: map.get(characterName)?.win || 0,
            lose: (map.get(characterName)?.lose || 0 ) + 1,
        });
    }
    }

  }



