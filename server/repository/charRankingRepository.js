class charRankingRepository {
    constructor() {

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


    insertCharRanking = async (date) => {
        const insertQuery = `
            INSERT INTO char_daily_stats (stat_date, char_name, total_matches, win_count, lose_count, rate)
            SELECT 
                DATE(matchDate) AS stat_date,
                charName,
                COUNT(*) AS total_matches,
                SUM(IF(result = 'win', 1, 0)) AS win_count,
                SUM(IF(result = 'lose', 1, 0)) AS lose_count,
                ROUND(SUM(IF(result = 'win', 1, 0)) / COUNT(*) * 100, 2) AS rate
            FROM matches_map
            where date(matchDate) = '${date}'
            GROUP BY stat_date, charName`;

        try {
            await mariadb.doQuery(insertQuery);
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }



}

module.exports = charRankingRepository;