class StatsSeasonRepository {
    constructor(maria) {
        this.maria = maria;
    }

    runQuery = async (query, params = []) => {
        const result = await this.maria.doQuery(query, params);

        if (result === -1) {
            throw new Error('Database query failed');
        }

        return result;
    }

    getSeasonTableName = (prefix, season) => {
        if (!/^\d{4}[HU]$/.test(season)) {
            throw new Error(`Invalid season code: ${season}`);
        }

        return `${prefix}_${season}`;
    }

    hasColumn = async (tableName, columnName) => {
        const query = `
            SELECT COUNT(*) AS cnt
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = ?
              AND COLUMN_NAME = ?
        `;
        const [row] = await this.runQuery(query, [tableName, columnName]);
        return Number(row?.cnt || 0) > 0;
    }

    assertTableExists = async (tableName) => {
        const query = `
            SELECT COUNT(*) AS cnt
            FROM information_schema.TABLES
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = ?
        `;
        const [row] = await this.runQuery(query, [tableName]);

        if (Number(row?.cnt || 0) === 0) {
            throw new Error(`Table not found: ${tableName}`);
        }
    }

    deleteSeasonStats = async (season) => {
        await this.runQuery(`DELETE FROM season_character_stats WHERE season_code = ?`, [season]);
        await this.runQuery(`DELETE FROM season_summary_stats WHERE season_code = ?`, [season]);
    }

    insertSeasonSummary = async (season, minMatches, hiddenOpExcludeRank) => {
        const matchesTable = this.getSeasonTableName('matches', season);
        await this.assertTableExists(matchesTable);

        const hasDurationColumn = await this.hasColumn(matchesTable, 'duration');
        const avgDurationExpr = hasDurationColumn
            ? 'ROUND(AVG(duration))'
            : `ROUND(AVG(CAST(JSON_UNQUOTE(JSON_EXTRACT(jsonData, '$.players[0].playInfo.playTime')) AS UNSIGNED)))`;

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
                ${avgDurationExpr},
                ?,
                ?
            FROM ${matchesTable}
            ON DUPLICATE KEY UPDATE
                total_matches = VALUES(total_matches),
                avg_duration = VALUES(avg_duration),
                min_matches = VALUES(min_matches),
                hidden_op_exclude_rank = VALUES(hidden_op_exclude_rank)
        `;

        await this.runQuery(query, [season, minMatches, hiddenOpExcludeRank]);
    }

    selectSeasonCharacterStats = async (season) => {
        const matchesTable = this.getSeasonTableName('matches', season);
        const matchesMapTable = this.getSeasonTableName('matches_map', season);

        await this.assertTableExists(matchesTable);
        await this.assertTableExists(matchesMapTable);

        const query = `
            SELECT
                ranked.char_name AS charName,
                ranked.total_matches AS totalMatches,
                ranked.win_count AS winCount,
                ranked.lose_count AS loseCount,
                ranked.win_rate AS winRate,
                ranked.total_rank AS totalRank,
                ranked.win_rate_rank AS winRateRank
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
                    FROM ${matchesMapTable} mm
                    INNER JOIN ${matchesTable} m ON m.matchId = mm.matchId
                    WHERE mm.charName IS NOT NULL
                      AND mm.result IN ('win', 'lose')
                      AND m.matchId IS NOT NULL
                    GROUP BY mm.charName
                ) aggregated
            ) ranked
        `;

        return await this.runQuery(query);
    }

    insertSeasonCharacterStats = async (season) => {
        const rows = await this.selectSeasonCharacterStats(season);
        if (!rows || rows.length === 0) {
            return;
        }

        const pool = this.maria.getPool();
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
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                total_matches = VALUES(total_matches),
                win_count = VALUES(win_count),
                lose_count = VALUES(lose_count),
                win_rate = VALUES(win_rate),
                total_rank = VALUES(total_rank),
                win_rate_rank = VALUES(win_rate_rank)
        `;

        const values = rows.map((row) => ([
            season,
            row.charName,
            row.totalMatches,
            row.winCount,
            row.loseCount,
            row.winRate,
            row.totalRank,
            row.winRateRank
        ]));

        await pool.batch(query, values);
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

        return await this.runQuery(query, [season]);
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
        `;

        if (Number.isFinite(limit)) {
            return await this.runQuery(`${query}\n LIMIT ?`, [season, minMatches, limit]);
        }

        return await this.runQuery(query, [season, minMatches]);
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
        `;

        if (Number.isFinite(limit)) {
            return await this.runQuery(`${query}\n LIMIT ?`, [season, limit]);
        }

        return await this.runQuery(query, [season]);
    }

    selectTopPickRate = async (season, limit) => {
        const query = `
            SELECT
                scs.char_name AS charName,
                scs.total_matches AS totalMatches,
                scs.win_count AS winCount,
                scs.lose_count AS loseCount,
                scs.win_rate AS winRate,
                ROUND(scs.total_matches / NULLIF(sss.total_matches, 0) * 100, 2) AS pickRate
            FROM season_character_stats scs
            INNER JOIN season_summary_stats sss
                ON sss.season_code = scs.season_code
            WHERE scs.season_code = ?
            ORDER BY pickRate DESC, scs.total_matches DESC, scs.char_name ASC
        `;

        if (Number.isFinite(limit)) {
            return await this.runQuery(`${query}\n LIMIT ?`, [season, limit]);
        }

        return await this.runQuery(query, [season]);
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

        return await this.runQuery(query, [season, minMatches, excludeRank, limit]);
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

        return await this.runQuery(query, [season, minMatches, topRank, limit]);
    }
}

module.exports = StatsSeasonRepository;
