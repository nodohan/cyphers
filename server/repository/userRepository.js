class userRepository {
    constructor(maria) {
        this.maria = maria;
    }
    
    selectUserMatches = async (playerId) => {
        const query = `
        select
            jsonData
        from matches_map 
        where playerId = ?
        and matchDate >= '2024-09-26 11:00:00'
        limit 3000`;

        try {
            return await this.maria.doQuery(query, [playerId]);
        } catch (err) {
            console.log("에러1",err);
            logger.error(err);
        }
        return null;
    }

    selectUserLatestRank = async (playerId) => {
        const query = `
            SELECT rankNumber 
            FROM userRank 
            WHERE playerId = ? 
            AND rankDate = (SELECT MAX(rankDate) FROM userRank)
        `;
        try {
            const rows = await this.maria.doQuery(query, [playerId]);
            return rows && rows.length > 0 ? rows[0].rankNumber : null;
        } catch (err) {
            logger.error(err);
            return null;
        }
    }

    selectUserRankHistory = async (playerId) => {
        const query = `
            SELECT rankNumber, DATE_FORMAT(rankDate, '%m/%d') as date
            FROM userRank 
            WHERE playerId = ? 
            ORDER BY rankDate DESC
            LIMIT 20
        `;
        try {
            const rows = await this.maria.doQuery(query, [playerId]);
            return rows ? rows.reverse() : []; // 시간 순으로 정렬
        } catch (err) {
            logger.error(err);
            return [];
        }
    }
}

module.exports = userRepository;