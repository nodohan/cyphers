const commonUtil = require('../util/commonUtil');
const StatsSeasonRepository = require('../repository/statsSeasonRepository');

module.exports = (scheduler, maria, acclogger) => {
    const app = require('express').Router();
    const statsSeasonRepository = new StatsSeasonRepository(maria);
    app.use(acclogger());

    const DEFAULT_MIN_MATCHES = 30;
    const DEFAULT_HIDDEN_OP_EXCLUDE_RANK = 20;

    const normalizeSeason = (season) => {
        const normalizedSeason = (season || '').toUpperCase();
        return /^\d{4}[HU]$/.test(normalizedSeason) ? normalizedSeason : null;
    };

    // test: /statsSeasonSche/rebuildSeasonStats?season=2025U
    app.get('/rebuildSeasonStats', async function(req, res) {
        if (!commonUtil.isMe(req)) {
            return res.send({ resultCode: '400', resultMsg: '내가 아닌데??' });
        }

        const season = normalizeSeason(req.query.season || '2025U');
        const minMatches = Number(req.query.minMatches || DEFAULT_MIN_MATCHES);
        const hiddenOpExcludeRank = Number(req.query.hiddenOpExcludeRank || DEFAULT_HIDDEN_OP_EXCLUDE_RANK);

        if (!season) {
            return res.send({ resultCode: '400', resultMsg: '시즌 코드 오류' });
        }

        try {
            await statsSeasonRepository.deleteSeasonStats(season);
            await statsSeasonRepository.insertSeasonSummary(season, minMatches, hiddenOpExcludeRank);
            await statsSeasonRepository.insertSeasonCharacterStats(season);

            return res.send({
                resultCode: '200',
                resultMsg: 'OK',
                season,
                minMatches,
                hiddenOpExcludeRank
            });
        } catch (err) {
            logger.error(err);
            return res.status(500).send({
                resultCode: '500',
                resultMsg: '오류 발생'
            });
        }
    });

    return app;
}
