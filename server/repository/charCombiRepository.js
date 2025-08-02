class charCombiRepository {
    constructor() {

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
                '${startDay}' AS stat_date,
                '${type}' AS stats_type,
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
                WHERE matchDate BETWEEN '${startDay}' AND '${endDay}'
                GROUP BY matchId, result, role
            ) AS combos
            GROUP BY role, char_combo
            ORDER BY role, win_rate_percent DESC, total_matches DESC
            `;

        try {
            await maria.doQuery(charCombiStatsQuery);
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }
    
    insertStats = async (statsDate, statsType, combiType, order, rankType) => {
        const insertQuery = `
            INSERT INTO char_combi_stats_ranked (
                stat_date, stats_type, role, char_combo, total_matches,
                win_count, win_rate_percent, rank_type, rank_no
            )
            SELECT 
                stat_date, stats_type, role, char_combo, total_matches,
                win_count, win_rate_percent,
                '${rankType}' AS rank_type,
                @rownum := @rownum + 1 AS rank_no
            FROM (
                SELECT * FROM char_combi_stats
                WHERE stat_date = '${statsDate}'
                  AND stats_type = '${statsType}'
                  AND role = '${combiType}'
                  AND total_matches > 100
                ORDER BY win_rate_percent ${order}
                LIMIT 20
            ) AS t, (SELECT @rownum := 0) AS r
        `;
    
        logger.debug(insertQuery);
    
        try {
            await maria.doQuery(insertQuery);
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }

}

module.exports = charCombiRepository;