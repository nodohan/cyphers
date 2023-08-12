class CombiRepository {
    constructor(maria) {
        this.maria = maria;
    }
    
    combiTotalCount = async() => {
        let query = "SELECT COUNT(1) cnt FROM matches WHERE matchdate IS NOT NULL and season = '2021U' ";
        let [result] = await this.maria.doQuery(query);
        return result.cnt || 0;
    }

    combiSearch = async(type, count, orderType, fromDt, toDt, charName) => {        
        let queryParams = [];
        let query = `
            SELECT *, CEILING(win / total * 100) AS late
            FROM (
                SELECT 
                    ${type} as combi, COUNT(1) total
                    , COUNT(IF(matchResult = '승', 1, NULL)) win
                    , COUNT(IF(matchResult = '패', 1, NULL)) lose 
                    , GROUP_CONCAT(detail.matchId) matchIds 
                FROM matchdetail detail 
                INNER JOIN ( 
                    SELECT 
                        matchId, matchDate 
                    FROM matches
                    WHERE matchDate BETWEEN ? AND ?
                ) matches ON matches.matchId = detail.matchId
                WHERE 1=1`;
    
        if (charName) {
            let charNames = charName.split(" ");
            for (let idx in charNames) {
                query += ` AND "${type}" LIKE ?`;
                queryParams.push(`%${charNames[idx]}%`);
            }
    
            if (charNames.length >= 3) {
                count = 1;
            }
        }
    
        query += ` GROUP BY ${type}
            ) a 
            WHERE total >= ?
            ORDER BY ${orderType} DESC`;
    
        queryParams.push(fromDt, toDt, count);
    
        logger.debug(query);
    
        return await this.maria.doQuery(query, queryParams);
    }

}

module.exports = CombiRepository;