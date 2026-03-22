const commonUtil = require('../util/commonUtil');
const SeasonRepository = require('../repository/seasonRepository');
const StatsSeasonRepository = require('../repository/statsSeasonRepository');
const RecentCharLeaderStatsRepository = require('../repository/recentCharLeaderStatsRepository');

module.exports = (scheduler, maria, acclogger) => {
    const app = require('express').Router();
    const seasonRepository = new SeasonRepository(maria);
    const statsSeasonRepository = new StatsSeasonRepository(maria);
    const recentCharLeaderStatsRepository = new RecentCharLeaderStatsRepository(maria);
    app.use(acclogger());

    const DEFAULT_MIN_MATCHES = 30;
    const DEFAULT_HIDDEN_OP_EXCLUDE_RANK = 20;
    const SIDE_LIMIT = 10;

    const getCurrentSeason = async() => {
        const currentSeason = await seasonRepository.selectCurrentSeason();
        if (!currentSeason) {
            throw new Error('Current season metadata not found');
        }

        return currentSeason;
    };

    const normalizeSeason = (season) => {
        const normalizedSeason = (season || '').toUpperCase();
        return /^\d{4}[HU]$/.test(normalizedSeason) ? normalizedSeason : null;
    };

    app.get('/stats', async function(req, res) {
        try {
            const currentSeason = await getCurrentSeason();

            if (commonUtil.isMobile(req)) {
                res.render('./mobile/stats');
            } else {
                res.render('./pc/stats', {
                    dataStartDate: currentSeason.season_start_date,
                    currentSeasonCode: currentSeason.season_code
                });
            }
        } catch (err) {
            logger.error(err);
            return res.status(500).send('season metadata not found').end();
        }
    });

    app.get('/statsCountList', async function(req, res) {
        try {
            const currentSeason = await getCurrentSeason();
            const query = ` SELECT dates, COUNT(dates) cnt FROM (
                SELECT DATE_FORMAT(matchDate, '%Y-%m-%d (%W)') dates, matchId FROM matches
                WHERE matchDate >= ?
             ) aa
             GROUP BY dates
             ORDER BY dates DESC
             LIMIT 30 `;

            const row = await maria.doQuery({ bigNumberStrings: true, sql: query }, [currentSeason.season_start_at]);
            res.send({ row });
        } catch (err) {
            logger.error(err);
            console.log(err);
            return res.status(500).send('?ㅻ쪟 諛쒖깮').end();
        }
    });

    app.get('/statsCharList', async function(req, res) {
        try {
            const currentSeason = await getCurrentSeason();
            const targetDate = req.query.date || commonUtil.getYYYYMMDD(commonUtil.addDays(new Date(), -1), false);
            const query = `
                select *
                from char_season_stats
                where stat_date = ?
                  and stat_date >= ?
                order by rate desc
            `;
            const row = await maria.doQuery({ bigNumberStrings: true, sql: query }, [targetDate, currentSeason.season_start_date]);
            res.send({ row });
        } catch (err) {
            logger.error(err);
            console.log(err);
            return res.status(500).send('?ㅻ쪟 諛쒖깮').end();
        }
    });

    app.get('/statsRecentCharLeaders', async function(req, res) {
        try {
            const currentSeason = await getCurrentSeason();
            const rows = await recentCharLeaderStatsRepository.selectLatestStats(currentSeason.season_code);

            const row = [30, 7].map((periodDays) => ({
                periodDays,
                latestRankDate: rows.find((item) => Number(item.periodDays) === periodDays)?.latestRankDate || null,
                list: rows
                    .filter((item) => Number(item.periodDays) === periodDays)
                    .map((item) => ({
                        char_name: item.charName,
                        total_matches: Number(item.totalMatches),
                        win_count: Number(item.winCount),
                        lose_count: Number(item.loseCount),
                        rate: Number(item.rate),
                        leaders: item.leadersJson ? JSON.parse(item.leadersJson) : []
                    }))
            }));

            res.send({ row });
        } catch (err) {
            logger.error(err);
            return res.status(500).send('?ㅻ쪟諛쒖깮').end();
        }
    });

    app.get('/rebuildRecentCharLeaderStats', async function(req, res) {
        if (!commonUtil.isMe(req)) {
            return res.send({ resultCode: '400', resultMsg: '내가 아닌데??' });
        }

        try {
            const currentSeason = await getCurrentSeason();
            await recentCharLeaderStatsRepository.rebuildStats({
                seasonCode: currentSeason.season_code,
                seasonStartAt: currentSeason.season_start_at
            });

            return res.send({ resultCode: '200', resultMsg: 'OK' });
        } catch (err) {
            logger.error(err);
            return res.status(500).send({ resultCode: '500', resultMsg: '오류발생' });
        }
    });

    app.get('/statsList', async function(req, res) {
        let todayStr = '';

        if (req.query.season != null) {
            todayStr = req.query.season;
        } else {
            let today = new Date();
            if (today.getHours() <= 4) {
                today = commonUtil.addDays(today, -1);
            }
            todayStr = commonUtil.getYYYYMMDD(today, false);
        }

        try {
            const currentSeason = await getCurrentSeason();
            const query = ` SELECT * FROM char_combi_stats_ranked WHERE stat_date = ? AND stat_date >= ? `;
            logger.debug(query);

            const row = await maria.doQuery(query, [todayStr, currentSeason.season_start_date]);
            res.send({ row });
        } catch (err) {
            logger.error(err);
            return res.status(500).send('?ㅻ쪟 諛쒖깮').end();
        }
    });

    app.get('/stats2022h', function(req, res) {
        res.render('./pc/statsSeason', { season: '2022H' });
    });

    app.get('/stats2022u', function(req, res) {
        res.render('./pc/statsSeason', { season: '2022U' });
    });

    app.get('/stats2023h', function(req, res) {
        res.render('./pc/statsSeason', { season: '2023H' });
    });

    app.get('/stats2023u', function(req, res) {
        res.render('./pc/statsSeason', { season: '2023U' });
    });

    app.get('/stats2024h', function(req, res) {
        res.render('./pc/statsSeason', { season: '2024H' });
    });

    app.get('/stats2024u', function(req, res) {
        res.render('./pc/statsSeason', { season: '2024U' });
    });

    app.get('/stats2025u', function(req, res) {
        res.render('./pc/statsSeason2025u', { season: '2025U' });
    });

    app.get('/stats2025h', function(req, res) {
        res.render('./pc/statsSeason2025u', { season: '2025H' });
    });

    app.get('/statsSeasonList', async function(req, res) {
        const season = req.query.season;

        try {
            const query = ` SELECT * FROM match_stats WHERE statsDate = '${season}' `;
            logger.debug(query);

            const row = await maria.doQuery(query);
            res.send({ row });
        } catch (err) {
            logger.error(err);
            return res.status(500).send('?ㅻ쪟 諛쒖깮').end();
        }
    });

    app.get('/stats2025uSummary', async function(req, res) {
        const season = normalizeSeason(req.query.season || '2025U');

        if (!season) {
            return res.status(400).send('?섎せ???쒖쫵 肄붾뱶').end();
        }

        try {
            const summaryRows = await statsSeasonRepository.selectSeasonSummary(season);
            const summary = summaryRows[0] || null;
            const minMatches = Number(summary?.minMatches || DEFAULT_MIN_MATCHES);
            const hiddenOpExcludeRank = Number(summary?.hiddenOpExcludeRank || DEFAULT_HIDDEN_OP_EXCLUDE_RANK);

            const [topWinRate, topTotalMatches, hiddenOp, trap] = await Promise.all([
                statsSeasonRepository.selectTopWinRate(season, minMatches),
                statsSeasonRepository.selectTopTotalMatches(season),
                statsSeasonRepository.selectHiddenOp(season, minMatches, hiddenOpExcludeRank, SIDE_LIMIT),
                statsSeasonRepository.selectTrap(season, minMatches, hiddenOpExcludeRank, SIDE_LIMIT)
            ]);

            res.send({
                row: {
                    overview: {
                        totalMatches: Number(summary?.totalMatches || 0),
                        avgDuration: summary?.avgDuration == null ? null : Number(summary.avgDuration)
                    },
                    thresholds: {
                        minMatches,
                        hiddenOpExcludeRank
                    },
                    topWinRate,
                    topTotalMatches,
                    hiddenOp,
                    trap
                }
            });
        } catch (err) {
            logger.error(err);
            return res.status(500).send('?ㅻ쪟 諛쒖깮').end();
        }
    });

    app.get('/charList', async function(req, res) {
        let season = req.query.season;
        if (season == null) {
            season = '2023U';
        }

        try {
            const query = ` SELECT * FROM char_stats where season = '${season}' ORDER BY rate DESC `;
            logger.debug(query);

            const row = await maria.doQuery(query);
            res.send({ row });
        } catch (err) {
            logger.error(err);
            return res.status(500).send('?ㅻ쪟 諛쒖깮').end();
        }
    });

    return app;
};
