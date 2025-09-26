const commonUtil = require('../util/commonUtil');

class MatchRepository {
    constructor() {

    }

    findRankUserList = async (matchType, day) => {
        let query;
        if (matchType == 'rating') {
            let searchDateStr = commonUtil.getYYYYMMDD(commonUtil.addDays(day, -20));
            query = `SELECT distinct playerId FROM userRank where rankDate > '${searchDateStr}' `;
        } else {
            query = `SELECT playerId FROM player`;
        }
        logger.debug(query);
        return await mariadb.doQuery(query);
    }

    insertMatchId = async (matchType, rows) => {
        let tableName = (matchType == 'rating') ? 'matches' : 'matches_normal';

        await mariadb.doQuery("DELETE FROM matchId_temp");
        let query = `INSERT INTO matchId_temp (matchId, season) VALUES ( ?, '2025FREE' ) `;
        logger.debug(query);

        try {
            const pool = mariadb.getPool();
            await pool.batch(query,rows.map(id => [id]));
            logger.debug("batch insert success, count=%d", rows.length);
        } catch (err) {
            logger.error("batch insert error", err);
            throw err;
        }
        
        let mergeQuery = `insert into ${tableName} (matchId, season) 
                        select matchId, season  
                        from matchId_temp 
                        where matchId not in ( 
                            select matchId from ${tableName} 
                        )`;

        logger.debug(mergeQuery);
        let result = await mariadb.doQuery(mergeQuery);

        logger.debug("insert MatchId End ");

        return result;
    }

}

module.exports = MatchRepository;