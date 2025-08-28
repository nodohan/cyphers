class MatchesMapRepository {
    constructor() {

    }
    
    selectMatches = async(day) =>  {
        const query = `
        select 
            matchId, jsonData, matchDate
        from matches 
        where matchId in ( 
            SELECT ma.matchId
            FROM matches ma
            LEFT JOIN (
                select matchId from matches_map group by matchId
            ) map ON map.matchId = ma.matchId 
            WHERE matchDate >= '${day}' AND map.matchId IS NULL
        ) limit 3000`;
       
        logger.debug(query);

        return await mariadb.doQuery(query);
    }
    
    getUserMatchesMap =  async (playerId) => {
        const query = `
            SELECT 
                playerId,
                POSITION,
                SUM(CASE WHEN result = 'win' THEN 1 ELSE 0 END) AS win_count,
                SUM(CASE WHEN result = 'lose' THEN 1 ELSE 0 END) AS lose_count,
                COUNT(*) AS total_games
            FROM matches_map
            WHERE POSITION IS NOT NULL
            and playerId = ? 
            GROUP BY playerId, POSITION
            `;
       
        return await mariadb.doQuery(query, [ playerId ]);
    }

    teamRate = async (playerIds) => {
        const cnt = playerIds.length <= 3 ? 2 : 3;
        const playerStr = playerIds.map(() => '?').join(', ');

        const query = `
            SELECT matchId, result
            FROM matches_map
            WHERE playerId IN (${playerStr})
            GROUP BY matchId, result
            HAVING COUNT(playerId) >= ${cnt}
        `;

        //logger.info("query: %s", query);

        try {
            return await mariadb.doQuery(query, [ ... playerIds ]);
        } catch (err){
            logger.err(err);
        }
        return null;
    }
    
    insertMatchMap = async (rows) => {
        const pool = mariadb.getPool();

        let query = `INSERT INTO matches_map (matchId, playerId, jsonData, matchDate, result, position, charName ) VALUES ( ?, ?, ?, ?, ?, ?, ? ) `;
        logger.debug(query);

        await pool.batch(query, rows, function(err) {
            console.log(err);
            logger.error(err);
            if (err) throw err;
        });
    }
    

}

module.exports = MatchesMapRepository;