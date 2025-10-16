const MatchesMapRepository = require('../repository/MatchesMapRepository');
const commonUtil = require('../util/commonUtil'); 

class MatchesMapService {
    constructor() {
        this.matchesMapRepository = new MatchesMapRepository();
    }

    insertMatchMap = async (day = new Date()) => {
        const yesterday = commonUtil.getYYYYMMDD(commonUtil.addDays(day, -1), false);
        let matchMap = [];

        try {
            const rows = await this.matchesMapRepository.selectMatches(yesterday);
            matchMap = this.extractPlayerId(rows);
            if(matchMap.length > 0 ) {
                await this.matchesMapRepository.insertMatchMap(matchMap);
            }
        } catch (err) {
            console.log("에러1",err);
            logger.error(err);
        }
        return matchMap.length > 0;
    }

    extractPlayerId = (rows) => {
        logger.debug("extract players");

        //사용자 매칭 데이터 검색 
        let matchMap = [];
        rows.forEach(row => {
            const { matchId, jsonData, matchDate} = row;
            let json = JSON.parse(jsonData);
            const teams = json.teams;
            json.players.forEach(row2 => {
                const { itemPurchase, items, playerId } = row2;
                row2["matchId"] = matchId;
                row2["date"] = matchDate;
                row2.playInfo.result = teams[0].players.some(playerId => playerId == row2.playerId) ? teams[0].result : teams[1].result;
                matchMap.push([matchId, playerId, row2, matchDate, row2.playInfo.result, this.classifyBuild(itemPurchase, items), row2.playInfo.characterName ]);
            });
        });

        return matchMap;
    }

    classifyBuild = (itemPurchase, items) => {
        if(itemPurchase == null) {
            return "기타";
        }

        const itemMap = new Map();
        for (const item of items) {
            itemMap.set(item.itemId, item);
        }
    
        const firstFiveItems = itemPurchase.slice(0, Math.min(8,itemPurchase.length))
            .map(id => itemMap.get(id))
            .filter(Boolean);
    
        const glovesCount = firstFiveItems.filter(item => item.slotName === "손(공격)").length;
        const chestExists = firstFiveItems.some(item => item.slotName === "가슴(체력)");
        const helmetCount = firstFiveItems.filter(item => item.slotName === "머리(치명)").length;
    
        if (glovesCount === 0) return "극방";
        if (glovesCount === 1) return "방벨";
        if (glovesCount >= 2) {
            if (!chestExists && helmetCount >= 2) return "극공";
            return "공벨";
        }
        return "기타";
    }
    
    updatePositionBatch = async() => {
        const batchSize = 1000;
        
        while (true) {
            const rows = await maria.doQuery(`SELECT jsonData FROM matches_map WHERE position IS NULL ORDER BY matchId ASC LIMIT ?`,[batchSize]);           
            if (rows.length === 0) break;
        
            for (const row of rows) {
                try {
                    const jsonData = JSON.parse(row.jsonData);
                    const {playerId, matchId } = jsonData;
                    const result = jsonData.playInfo?.result ?? null;
                    const itemPurchase = jsonData.itemPurchase ?? [];
                    const items = jsonData.items ?? [];
            
                    const position = this.classifyBuild(itemPurchase, items);
                    await mariadb.doQuery(`UPDATE matches_map SET result = ?, position = ? WHERE matchId = ? and playerId = ?`, [result, position, matchId, playerId]);

                    log.info("update matchesMap %s", matchId);

                } catch (err) {
                    console.error(`❌ ID ${row.id} 처리 실패:`, err.message);
                    // 실패했어도 진행
                }
            }
        }
    }

    getUserMatchesMap = async (playerId) => {
         return await this.matchesMapRepository.getUserMatchesMap(playerId);
    }

    teamRate = async (playerIds) =>  {
        const matchResults = await this.matchesMapRepository.teamRate(playerIds);
        const wins = matchResults.filter(r => r.result === 'win').length
        return { "rate" :  this.calculateWinRate(matchResults,wins), "total": matchResults.length, "win" : wins, "lose" : matchResults.length-wins, "data" : matchResults };
    }
    
    calculateWinRate = (matchResults, wins) => {
        const total = matchResults.length;
        const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
        return `${winRate}%`;
    };


}

module.exports = MatchesMapService;
