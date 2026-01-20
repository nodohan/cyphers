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
        // Whitelist validation for orderType to prevent SQL injection.
        const allowedOrderTypes = ['total', 'late'];
        const safeOrderType = allowedOrderTypes.includes(orderType) ? orderType : 'late';

        // IMPORTANT: The 'type' parameter is used as a column name, which cannot be parameterized.
        // This is a potential SQL injection risk if the input is not sanitized.
        // A proper fix would be to validate 'type' against a whitelist of allowed column names.
        const safeType = type.replace(/[^a-zA-Z0-9_]/g, '');

        let queryParams = [fromDt, toDt];
        let query = `
            SELECT *, CEILING(win / total * 100) AS late
            FROM (
                SELECT 
                    ${safeType} as combi, COUNT(1) total
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
                // Corrected to use the sanitized column name
                query += ` AND ${safeType} LIKE ?`;
                queryParams.push(`%${charNames[idx]}%`);
            }
    
            if (charNames.length >= 3) {
                count = 1;
            }
        }
    
        query += ` GROUP BY ${safeType}
            ) a 
            WHERE total >= ?
            ORDER BY ${safeOrderType} DESC`;
    
        queryParams.push(count);
    
        logger.debug(query);
    
        return await this.maria.doQuery(query, queryParams);
    }

}

module.exports = CombiRepository;