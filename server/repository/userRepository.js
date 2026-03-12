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
            ORDER BY rankDate DESC 
            LIMIT 2
        `;
        try {
            const rows = await this.maria.doQuery(query, [playerId]);
            if (rows && rows.length > 0) {
                const latestRank = rows[0].rankNumber;
                let rankDiff = null;
                if (rows.length > 1) {
                    rankDiff = rows[1].rankNumber - latestRank;
                }
                return {
                    rank: latestRank,
                    rankDiff: rankDiff
                };
            }
            return null;
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