class matchDetailCharRepository {
    constructor(maria) {
        this.maria = maria;
    }
    
    selectMatchDetailByMatchDate = async(dateStr) => {
        const query = `        
            SELECT 
                jsonData 
            FROM matches 
            WHERE matchDate >= STR_TO_DATE(?, '%Y-%m-%d')
            AND matchDate < STR_TO_DATE(?, '%Y-%m-%d') + INTERVAL 1 DAY limit 3 `;
        return await this.maria.doQuery(query,[dateStr, dateStr]);
    }


    selectMatchDetailByMatchDateTest = async(dateStr) => {
        const query = `        
            SELECT jsonData
            FROM matches 
            WHERE matchDate >= CURRENT_DATE() -2 
            AND jsonData LIKE '%1826e7c7f0becbc1e65ee644c28f0072%' `;
        return await this.maria.doQuery(query,[dateStr, dateStr]);
    }


    selectMatchDetailByPlayerId = async(playerId, limit) => {
        const query = `
            SELECT
                jsonData
            FROM matches
            WHERE matchDate >= '2023-09-13'
            AND jsonData LIKE '%${playerId}%' limit ?`;
        return await this.maria.doQuery(query, [ limit ]);
    }

    // 
    selectLastNickNames = async() => {
        const query = `
        SELECT 
            oName.playerId, oName.nickname
        FROM nickNames oName
        INNER JOIN (
            SELECT playerId, MAX(checkingDate) AS MaxDate
            FROM nickNames
            GROUP BY playerId
        ) topName ON oName.playerId = topName.playerId AND oName.checkingDate = topName.MaxDate; `;
        return await this.maria.doQuery(query);
    }


}

module.exports = matchDetailCharRepository;