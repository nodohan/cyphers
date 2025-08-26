class MatchRepository {
    constructor() {

    }

    findRankUserList = async (matchType) => {
        let query;
        if (matchType == 'rating') {
            let searchDateStr = commonUtil.getYYYYMMDD(commonUtil.addDays(day, -20));
            query = `SELECT distinct playerId FROM userRank where rankDate > '${searchDateStr}' `;
        } else {
            query = `SELECT playerId FROM player`;
        }
        logger.debug(query);
        return await maria.doQuery(query);
    }

    insertMatchId = async (matchType, rows) => {
        let tableName = matchType == 'rating' ? 'matches' : 'matches_normal';

        await mariadb.doQuery("DELETE FROM matchId_temp");
        let query = `INSERT INTO matchId_temp (matchId, season) VALUES ( ?, '2025H' ) `;
        logger.debug(query);

        const pool = mariadb.getPool();
        await pool.batch(query, rows.map(id => [id]), function(err) {
            console.log(err);
            logger.error(err);
            if (err) throw err;
        });

        let mergeQuery = `insert into ${tableName} (matchId, season) 
                        select matchId, season  
                        from matchId_temp 
                        where matchId not in ( 
                            select matchId from ${tableName} 
                        )`;

        logger.debug(mergeQuery);
        let result = await maria.doQuery(mergeQuery);

        logger.debug("insert MatchId End ");

        return result;
    }



}

module.exports = MatchRepository;