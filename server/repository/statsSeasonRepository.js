class StatsSeasonRepository {
    constructor(maria) {
        this.maria = maria;
    }

    deleteSeasonStats = async (season) => {
        await this.maria.doQuery(`DELETE FROM season_character_stats WHERE season_code = ?`, [season]);
        await this.maria.doQuery(`DELETE FROM season_summary_stats WHERE season_code = ?`, [season]);
    }

    insertSeasonSummary = async (season, minMatches, hiddenOpExcludeRank) => {
        const query = `
            INSERT INTO season_summary_stats (
                season_code,
                total_matches,
                avg_duration,
                min_matches,
                hidden_op_exclude_rank
            )
            SELECT
                ?,
                COUNT(*),
                ROUND(AVG(duration)),
                ?,
                ?
            FROM matches_2025U
        `;

        await this.maria.doQuery(query, [season, minMatches, hiddenOpExcludeRank]);
    }

    insertSeasonCharacterStats = async (season) => {
        const query = `
            INSERT INTO season_character_stats (
                season_code,
                char_name,
                total_matches,
                win_count,
                lose_count,
                win_rate,
                total_rank,
                win_rate_rank
            )
            SELECT
                ?,
                ranked.char_name,
                ranked.total_matches,
                ranked.win_count,
                ranked.lose_count,
                ranked.win_rate,
                ranked.total_rank,
                ranked.win_rate_rank
            FROM (
                SELECT
                    aggregated.char_name,
                    aggregated.total_matches,
                    aggregated.win_count,
                    aggregated.lose_count,
                    aggregated.win_rate,
                    ROW_NUMBER() OVER (
                        ORDER BY aggregated.total_matches DESC, aggregated.win_rate DESC, aggregated.char_name ASC
                    ) AS total_rank,
                    ROW_NUMBER() OVER (
                        ORDER BY aggregated.win_rate DESC, aggregated.total_matches DESC, aggregated.char_name ASC
                    ) AS win_rate_rank
                FROM (
                    SELECT
                        mm.charName AS char_name,
                        COUNT(*) AS total_matches,
                        SUM(CASE WHEN mm.result = 'win' THEN 1 ELSE 0 END) AS win_count,
                        SUM(CASE WHEN mm.result = 'lose' THEN 1 ELSE 0 END) AS lose_count,
                        ROUND(SUM(CASE WHEN mm.result = 'win' THEN 1 ELSE 0 END) / COUNT(*) * 100, 2) AS win_rate
                    FROM matches_map mm
                    INNER JOIN matches_2025U m ON m.matchId = mm.matchId
                    WHERE mm.charName IS NOT NULL
                      AND mm.result IN ('win', 'lose')
                      AND m.matchId IS NOT NULL
                    GROUP BY mm.charName
                ) aggregated
            ) ranked
        `;

        await this.maria.doQuery(query, [season]);
    }

    selectSeasonSummary = async (season) => {
        const query = `
            SELECT
                season_code AS seasonCode,
                total_matches AS totalMatches,
                avg_duration AS avgDuration,
                min_matches AS minMatches,
                hidden_op_exclude_rank AS hiddenOpExcludeRank
            FROM season_summary_stats
            WHERE season_code = ?
        `;

        return await this.maria.doQuery(query, [season]);
    }

    selectTopWinRate = async (season, minMatches, limit) => {
        const query = `
            SELECT
                char_name AS charName,
                total_matches AS totalMatches,
                win_count AS winCount,
                lose_count AS loseCount,
                win_rate AS winRate
            FROM season_character_stats
            WHERE season_code = ?
              AND total_matches >= ?
            ORDER BY win_rate DESC, total_matches DESC, char_name ASC
            LIMIT ?
        `;

        return await this.maria.doQuery(query, [season, minMatches, limit]);
    }

    selectTopTotalMatches = async (season, limit) => {
        const query = `
            SELECT
                char_name AS charName,
                total_matches AS totalMatches,
                win_count AS winCount,
                lose_count AS loseCount,
                win_rate AS winRate
            FROM season_character_stats
            WHERE season_code = ?
            ORDER BY total_matches DESC, win_rate DESC, char_name ASC
            LIMIT ?
        `;

        return await this.maria.doQuery(query, [season, limit]);
    }

    selectHiddenOp = async (season, minMatches, excludeRank, limit) => {
        const query = `
            SELECT
                char_name AS charName,
                total_matches AS totalMatches,
                win_count AS winCount,
                lose_count AS loseCount,
                win_rate AS winRate
            FROM season_character_stats
            WHERE season_code = ?
              AND total_matches >= ?
              AND total_rank > ?
            ORDER BY win_rate DESC, total_matches DESC, char_name ASC
            LIMIT ?
        `;

        return await this.maria.doQuery(query, [season, minMatches, excludeRank, limit]);
    }

    selectTrap = async (season, minMatches, topRank, limit) => {
        const query = `
            SELECT
                char_name AS charName,
                total_matches AS totalMatches,
                win_count AS winCount,
                lose_count AS loseCount,
                win_rate AS winRate
            FROM season_character_stats
            WHERE season_code = ?
              AND total_matches >= ?
              AND total_rank <= ?
            ORDER BY win_rate ASC, total_matches DESC, char_name ASC
            LIMIT ?
        `;

        return await this.maria.doQuery(query, [season, minMatches, topRank, limit]);
    }
}

module.exports = StatsSeasonRepository;
