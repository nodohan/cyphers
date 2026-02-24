class charRankingRepository {
    constructor(maria) {
        this.maria = maria;
    }

    combiSearch = async(type, count, orderType, fromDt, toDt, charName) => {        
        let queryParams = [fromDt, toDt];
        let query = `
            SELECT *, CEILING(win / total * 100) AS late
            FROM (
                SELECT 
                    ? as combi, COUNT(1) total
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
        
        queryParams.push(type);

        if (charName) {
            let charNames = charName.split(" ");
            for (let idx in charNames) {
                query += ` AND ? LIKE ?`;
                queryParams.push(type, `%${charNames[idx]}%`);
            }
    
            if (charNames.length >= 3) {
                count = 1;
            }
        }
    
        query += ` GROUP BY ?
            ) a 
            WHERE total >= ?
            ORDER BY ? DESC`;
    
        queryParams.push(type, count, orderType);
    
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
            where date(matchDate) = ?
            GROUP BY stat_date, charName`;

        try {
            await this.maria.doQuery(insertQuery, [date]);
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }

    insertSeasonCharRanking = async (date) => {
        const insertQuery = `
            INSERT INTO char_season_stats (stat_date, char_name, total_matches, win_count, lose_count, rate)
            SELECT 
                ? AS stat_date,
                charName,
                COUNT(*) AS total_matches,
                SUM(IF(result = 'win', 1, 0)) AS win_count,
                SUM(IF(result = 'lose', 1, 0)) AS lose_count,
                ROUND(SUM(IF(result = 'win', 1, 0)) / COUNT(*) * 100, 2) AS rate
            FROM matches_map
            where date(matchDate) > '2025-09-25'
            GROUP BY stat_date, charName`;

        try {
            await this.maria.doQuery(insertQuery, [date]);
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }

    updateMatchesMapRating = async (date) => {
        const query = `
            UPDATE matches_map mm
            INNER JOIN (select * from userRank where rankDate = ? )  ur
            ON mm.playerId = ur.playerId
            AND DATE(mm.matchDate) = ur.rankDate
            SET mm.rating = ur.rp`;
    
        try {
            await this.maria.doQuery(query, [date]);
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }

    selectCharRankForRating = async(statsType, day, ratingType) => {
        const query = `
            select * 
            from char_season_stats
            where stats_type = ? 
            and stat_date = ? 
            and rating_type = ? 
            order by rate desc
        `;

        try {
            return await this.maria.doQuery(query, [statsType, day, ratingType]);
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }

}

module.exports = charRankingRepository;