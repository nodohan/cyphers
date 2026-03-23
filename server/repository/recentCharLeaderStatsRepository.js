class RecentCharLeaderStatsRepository {
    constructor(maria) {
        this.maria = maria;
    }

    runQuery = async(query, params = []) => {
        const result = await this.maria.doQuery(query, params);
        if (result === -1) {
            throw new Error('Database query failed');
        }
        return result;
    }

    ensureTable = async() => {
        const query = `
            CREATE TABLE IF NOT EXISTS recent_char_leader_stats (
                stat_date DATE NOT NULL,
                season_code VARCHAR(16) NOT NULL,
                latest_rank_date DATE NOT NULL,
                period_days TINYINT NOT NULL,
                char_name VARCHAR(30) NOT NULL,
                total_matches INT NOT NULL,
                win_count INT NOT NULL,
                lose_count INT NOT NULL,
                rate DECIMAL(5,2) NOT NULL,
                leaders_json MEDIUMTEXT NULL,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (stat_date, season_code, period_days, char_name),
                KEY idx_recent_char_leader_lookup (season_code, period_days, stat_date)
            )
        `;

        await this.runQuery(query);
    }

    selectLatestRankDate = async() => {
        const query = `SELECT DATE_FORMAT(MAX(rankDate), '%Y-%m-%d') AS latestRankDate FROM userRank`;
        const rows = await this.runQuery(query);
        return rows?.[0]?.latestRankDate || null;
    }

    calculatePeriodStats = async(seasonCode, seasonStartAt, latestRankDate, periodDays) => {
        const query = `
            SELECT
                overall.char_name,
                overall.total_matches,
                overall.win_count,
                overall.lose_count,
                overall.rate,
                IFNULL(
                    GROUP_CONCAT(
                        CONCAT_WS('||',
                            leader.player_id,
                            leader.nickname,
                            leader.rank_number,
                            leader.player_matches,
                            leader.player_win_count,
                            leader.player_lose_count,
                            leader.player_rate
                        )
                        ORDER BY leader.player_matches DESC, leader.rank_number ASC, leader.nickname ASC
                        SEPARATOR '##'
                    ),
                    ''
                ) AS leaders
            FROM (
                SELECT
                    mm.charName AS char_name,
                    COUNT(*) AS total_matches,
                    SUM(mm.result = 'win') AS win_count,
                    SUM(mm.result = 'lose') AS lose_count,
                    ROUND(SUM(mm.result = 'win') / COUNT(*) * 100, 2) AS rate
                FROM matches_map mm
                INNER JOIN (
                    SELECT playerId
                    FROM userRank
                    WHERE rankDate = ?
                      AND rankNumber <= 600
                ) ranked_users ON ranked_users.playerId = mm.playerId
                WHERE mm.matchDate >= GREATEST(?, DATE_SUB(CURDATE(), INTERVAL ? DAY))
                  AND mm.result IN ('win', 'lose')
                GROUP BY mm.charName
            ) overall
            LEFT JOIN (
                SELECT *
                FROM (
                    SELECT
                        mm.charName AS char_name,
                        mm.playerId AS player_id,
                        ur.nickname,
                        ur.rankNumber AS rank_number,
                        COUNT(*) AS player_matches,
                        SUM(mm.result = 'win') AS player_win_count,
                        SUM(mm.result = 'lose') AS player_lose_count,
                        ROUND(SUM(mm.result = 'win') / COUNT(*) * 100, 2) AS player_rate,
                        ROW_NUMBER() OVER (
                            PARTITION BY mm.charName
                            ORDER BY COUNT(*) DESC, ur.rankNumber ASC, ur.nickname ASC
                        ) AS row_num
                    FROM matches_map mm
                    INNER JOIN (
                        SELECT playerId, nickname, rankNumber
                        FROM userRank
                        WHERE rankDate = ?
                          AND rankNumber <= 600
                    ) ur ON ur.playerId = mm.playerId
                    WHERE mm.matchDate >= GREATEST(?, DATE_SUB(CURDATE(), INTERVAL ? DAY))
                      AND mm.result IN ('win', 'lose')
                    GROUP BY mm.charName, mm.playerId, ur.nickname, ur.rankNumber
                ) ranked
                WHERE ranked.row_num <= 5
            ) leader ON leader.char_name = overall.char_name
            GROUP BY
                overall.char_name,
                overall.total_matches,
                overall.win_count,
                overall.lose_count,
                overall.rate
            ORDER BY overall.rate DESC, overall.total_matches DESC, overall.char_name ASC
        `;

        const rows = await this.runQuery(
            { bigNumberStrings: true, sql: query },
            [latestRankDate, seasonStartAt, periodDays - 1, latestRankDate, seasonStartAt, periodDays - 1]
        );

        return rows.map((row) => ({
            statDate: new Date().toISOString().slice(0, 10),
            seasonCode,
            latestRankDate,
            periodDays,
            charName: row.char_name,
            totalMatches: Number(String(row.total_matches).replace(/,/g, '')),
            winCount: Number(String(row.win_count).replace(/,/g, '')),
            loseCount: Number(String(row.lose_count).replace(/,/g, '')),
            rate: Number(row.rate),
            leadersJson: JSON.stringify(
                (row.leaders || '').split('##').filter(Boolean).map((leader) => {
                    const [player_id, nickname, rank_number, player_matches, player_win_count, player_lose_count, player_rate] = leader.split('||');
                    return {
                        player_id,
                        nickname,
                        rank_number: Number(rank_number),
                        player_matches: Number(player_matches),
                        player_win_count: Number(player_win_count),
                        player_lose_count: Number(player_lose_count),
                        player_rate: Number(player_rate)
                    };
                })
            )
        }));
    }

    rebuildStats = async({ seasonCode, seasonStartAt }) => {
        await this.ensureTable();

        const latestRankDate = await this.selectLatestRankDate();
        if (!latestRankDate) {
            throw new Error('Latest rank date not found');
        }

        const periods = [30, 7];
        const periodResults = await Promise.all(
            periods.map((periodDays) => this.calculatePeriodStats(seasonCode, seasonStartAt, latestRankDate, periodDays))
        );

        const rows = periodResults.flat();
        const today = new Date().toISOString().slice(0, 10);

        await this.runQuery(
            `DELETE FROM recent_char_leader_stats WHERE stat_date = ? AND season_code = ?`,
            [today, seasonCode]
        );

        if (rows.length === 0) {
            return;
        }

        const query = `
            INSERT INTO recent_char_leader_stats (
                stat_date,
                season_code,
                latest_rank_date,
                period_days,
                char_name,
                total_matches,
                win_count,
                lose_count,
                rate,
                leaders_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                latest_rank_date = VALUES(latest_rank_date),
                total_matches = VALUES(total_matches),
                win_count = VALUES(win_count),
                lose_count = VALUES(lose_count),
                rate = VALUES(rate),
                leaders_json = VALUES(leaders_json)
        `;

        const values = rows.map((row) => ([
            row.statDate,
            row.seasonCode,
            row.latestRankDate,
            row.periodDays,
            row.charName,
            row.totalMatches,
            row.winCount,
            row.loseCount,
            row.rate,
            row.leadersJson
        ]));

        await this.maria.getPool().batch(query, values);
    }

    selectLatestStats = async(seasonCode) => {
        await this.ensureTable();

        const query = `
            SELECT
                stat_date AS statDate,
                season_code AS seasonCode,
                DATE_FORMAT(latest_rank_date, '%Y-%m-%d') AS latestRankDate,
                period_days AS periodDays,
                char_name AS charName,
                total_matches AS totalMatches,
                win_count AS winCount,
                lose_count AS loseCount,
                rate,
                leaders_json AS leadersJson
            FROM recent_char_leader_stats
            WHERE season_code = ?
              AND stat_date = (
                  SELECT MAX(stat_date)
                  FROM recent_char_leader_stats
                  WHERE season_code = ?
              )
            ORDER BY period_days DESC, rate DESC, total_matches DESC, char_name ASC
        `;

        return await this.runQuery(query, [seasonCode, seasonCode]);
    }
}

module.exports = RecentCharLeaderStatsRepository;
