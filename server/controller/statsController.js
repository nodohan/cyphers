const commonUtil = require('../util/commonUtil');
const SeasonRepository = require('../repository/seasonRepository');
const StatsSeasonRepository = require('../repository/statsSeasonRepository');

module.exports = (scheduler, maria, acclogger) => {
    const app = require('express').Router();
    const seasonRepository = new SeasonRepository(maria);
    const statsSeasonRepository = new StatsSeasonRepository(maria);
    app.use(acclogger());

    const DEFAULT_MIN_MATCHES = 30;
    const DEFAULT_HIDDEN_OP_EXCLUDE_RANK = 20;
    const TOP_LIMIT = 20;
    const SIDE_LIMIT = 10;

    const getCurrentSeason = async () => {
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
                res.render('../mobile/stats');
            } else {
                res.render('../pc/stats', { dataStartDate: currentSeason.season_start_date });
            }
        } catch (err) {
            logger.error(err);
            return res
                .status(500)
                .send('season metadata not found')
                .end();
        }
    });

    app.get('/statsCountList', async function(req, res) {        

        try {
            const currentSeason = await getCurrentSeason();
            let query = ` SELECT dates, COUNT(dates) cnt FROM ( 
             	SELECT DATE_FORMAT(matchDate, '%Y-%m-%d (%W)') dates, matchId FROM matches
                WHERE matchDate >= ?
             ) aa  
             GROUP BY dates 
             ORDER BY dates DESC 
             LIMIT 30 `;

            let row = await maria.doQuery({ bigNumberStrings: true, sql: query }, [currentSeason.season_start_at]);
            res.send({ 'row': row });
        } catch (err) {
            logger.error(err);
            console.log(err);
            return res
                .status(500)
                .send('오류 발생')
                .end();
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
            res.send({ 'row': row });
        } catch (err) {
            logger.error(err);
            console.log(err);
            return res
                .status(500)
                .send('오류 발생')
                .end();
        }
    });

    // 메인 (/stats/statsList)
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
            let query = ` SELECT * FROM char_combi_stats_ranked WHERE stat_date = ? AND stat_date >= ? `;
            // let query = ` SELECT * FROM match_stats WHERE statsDate = ? `;
            logger.debug(query);

            let row = await maria.doQuery(query, [todayStr, currentSeason.season_start_date]);
            res.send({ 'row': row });
        } catch (err) {
            logger.error(err);
            return res
                .status(500)
                .send('오류 발생')
                .end();
        }
    });

    app.get('/stats2022h', function(req, res) {
        res.render('./pc/statsSeason', { 'season': '2022H' });
    });

    app.get('/stats2022u', function(req, res) {
        res.render('./pc/statsSeason', { 'season': '2022U' });
    });

    app.get('/stats2023h', function(req, res) {
        res.render('./pc/statsSeason', { 'season': '2023H' });
    });

    app.get('/stats2023u', function(req, res) {
        res.render('./pc/statsSeason', { 'season': '2023U' });
    });

    app.get('/stats2024h', function(req, res) {
        res.render('./pc/statsSeason', { 'season': '2024H' });
    });

    app.get('/stats2024u', function(req, res) {
        res.render('./pc/statsSeason', { 'season': '2024U' });
    });

    app.get('/stats2025u', function(req, res) {
        res.render('./pc/statsSeason2025u', { 'season': '2025U' });
    });

    app.get('/statsSeasonList', async function(req, res) {
        let season = req.query.season

        try {
            let query = ` SELECT * FROM match_stats WHERE statsDate = '${season}' `;
            logger.debug(query);

            let row = await maria.doQuery(query);
            res.send({ 'row': row });
        } catch (err) {
            logger.error(err);
            return res
                .status(500)
                .send('오류 발생')
                .end();
        }
    });

    app.get('/stats2025uSummary', async function(req, res) {
        const season = normalizeSeason(req.query.season || '2025U');

        if (!season) {
            return res
                .status(400)
                .send('잘못된 시즌 코드')
                .end();
        }

        try {
            const summaryRows = await statsSeasonRepository.selectSeasonSummary(season);
            const summary = summaryRows[0] || null;
            const minMatches = Number(summary?.minMatches || DEFAULT_MIN_MATCHES);
            const hiddenOpExcludeRank = Number(summary?.hiddenOpExcludeRank || DEFAULT_HIDDEN_OP_EXCLUDE_RANK);

            const [topWinRate, topTotalMatches, hiddenOp, trap] = await Promise.all([
                statsSeasonRepository.selectTopWinRate(season, minMatches, TOP_LIMIT),
                statsSeasonRepository.selectTopTotalMatches(season, TOP_LIMIT),
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
            return res
                .status(500)
                .send('오류 발생')
                .end();
        }
    });

    app.get('/charList', async function(req, res) {
        let season = req.query.season;
        if (season == null) {
            season = '2023U';
        }

        try {
            let query = ` SELECT * FROM char_stats where season = '${season}' ORDER BY rate DESC `;
            logger.debug(query);

            let row = await maria.doQuery(query);
            res.send({ 'row': row });
        } catch (err) {
            logger.error(err);
            return res
                .status(500)
                .send('오류 발생')
                .end();
        }
    });

    return app;
}
