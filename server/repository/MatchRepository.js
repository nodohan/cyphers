const commonUtil = require('../util/commonUtil');

class MatchRepository {
    constructor(maria) {
        this.maria = maria;
    }

    findRankUserList = async (matchType, day) => {
        let query;
        if (matchType == 'rating') {
            let searchDateStr = commonUtil.getYYYYMMDD(commonUtil.addDays(day, -20));
            query = `SELECT distinct playerId FROM userRank where rankDate > ?`;
            logger.debug(query);
            return await this.maria.doQuery(query, [searchDateStr]);
        } else {
            query = `SELECT playerId FROM player`;
            logger.debug(query);
            return await this.maria.doQuery(query);
        }
    }

    insertMatchId = async (matchType, rows) => {
        const allowedMatchTypes = {
            rating: 'matches',
            normal: 'matches_normal'
        };

        const tableName = allowedMatchTypes[matchType];
        if (!tableName) {
            const error = new Error(`Invalid matchType: ${matchType}`);
            logger.error(error);
            throw error;
        }

        await this.maria.doQuery("DELETE FROM matchId_temp");
        let query = `INSERT INTO matchId_temp (matchId, season) VALUES ( ?, '2025U' ) `;
        logger.debug(query);

        try {
            const pool = this.maria.getPool();
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
        let result = await this.maria.doQuery(mergeQuery);

        logger.debug("insert MatchId End ");

        return result;
    }

}

module.exports = MatchRepository;