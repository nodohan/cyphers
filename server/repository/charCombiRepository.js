class charCombiRepository {
    constructor(maria) {
        this.maria = maria;
    }

    calcCombiDate = async (type, startDay, endDay) => {
        const charCombiStatsQuery = `
            INSERT INTO char_combi_stats (
                stat_date,
                stats_type,
                role,
                char_combo,
                total_matches,
                win_count,
                win_rate_percent
            )
            SELECT
                ? AS stat_date,
                ? AS stats_type,
                role,
                char_combo,
                COUNT(*) AS total_matches,
                SUM(result = 'win') AS win_count,
                ROUND(SUM(result = 'win') / COUNT(*) * 100, 2) AS win_rate_percent
            FROM (
                SELECT
                    matchId,
                    result,
                    CASE
                        WHEN position IN ('공벨', '극공', '밸런스') THEN '딜러'
                        WHEN position IN ('극방', '방벨') THEN '탱커'
                        ELSE '기타'
                    END AS role,
                    GROUP_CONCAT(charName ORDER BY charName ASC) AS char_combo
                FROM matches_map
                WHERE matchDate BETWEEN ? AND ?
                GROUP BY matchId, result, role
            ) AS combos
            GROUP BY role, char_combo
            ORDER BY role, win_rate_percent DESC, total_matches DESC
            `;

        try {
            await this.maria.doQuery(charCombiStatsQuery, [endDay, type, startDay, endDay]);
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }
    
    insertStats = async (statsDate, statsType, combiType, order, rankType) => {
        // Whitelist validation for dynamic, non-parameterizable values
        const safeOrder = ['ASC', 'DESC'].includes(order.toUpperCase()) ? order.toUpperCase() : 'DESC';
        const totalMatchesThreshold = statsType === 'weekly' ? 10 : 50;
        
        const insertQuery = `
            INSERT INTO char_combi_stats_ranked (
                stat_date, stats_type, role, char_combo, total_matches,
                win_count, win_rate_percent, rank_type, rank_no
            )
            SELECT 
                stat_date, stats_type, role, char_combo, total_matches,
                win_count, win_rate_percent,
                ? AS rank_type,
                @rownum := @rownum + 1 AS rank_no
            FROM (
                SELECT * FROM char_combi_stats
                WHERE stat_date = ?
                  AND stats_type = ?
                  AND role = ?
                  AND total_matches > ?
                ORDER BY win_rate_percent ${safeOrder}
                LIMIT 20
            ) AS t, (SELECT @rownum := 0) AS r
        `;
    
        const queryParams = [rankType, statsDate, statsType, combiType, totalMatchesThreshold];
    
        logger.debug(insertQuery);
    
        try {
            await this.maria.doQuery(insertQuery, queryParams);
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }

}

module.exports = charCombiRepository;