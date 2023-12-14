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

    selectMatchDetailByPlayerId = async(playerId, limit) => {
        const query = `
            SELECT
                jsonData
            FROM matches
            WHERE matchDate >= '2023-09-13'
            AND jsonData LIKE '%${playerId}%' limit ?`;
        return await this.maria.doQuery(query, [ limit ]);
    }


}

module.exports = matchDetailCharRepository;