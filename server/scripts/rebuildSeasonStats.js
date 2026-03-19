global.logger = require('../../config/winston');
require('dotenv').config();

const maria = require('../../config/maria');
const StatsSeasonRepository = require('../repository/statsSeasonRepository');

const DEFAULT_MIN_MATCHES = 30;
const DEFAULT_HIDDEN_OP_EXCLUDE_RANK = 20;

function parseArgs(argv) {
    const options = {
        seasons: [],
        minMatches: DEFAULT_MIN_MATCHES,
        hiddenOpExcludeRank: DEFAULT_HIDDEN_OP_EXCLUDE_RANK
    };

    for (let i = 0; i < argv.length; i += 1) {
        const token = argv[i];

        if (token === '--season') {
            options.seasons.push(String(argv[i + 1] || '').toUpperCase());
            i += 1;
            continue;
        }

        if (token === '--seasons') {
            options.seasons = String(argv[i + 1] || '')
                .split(',')
                .map((season) => season.trim().toUpperCase())
                .filter(Boolean);
            i += 1;
            continue;
        }

        if (token === '--minMatches') {
            options.minMatches = Number(argv[i + 1] || DEFAULT_MIN_MATCHES);
            i += 1;
            continue;
        }

        if (token === '--hiddenOpExcludeRank') {
            options.hiddenOpExcludeRank = Number(argv[i + 1] || DEFAULT_HIDDEN_OP_EXCLUDE_RANK);
            i += 1;
        }
    }

    return options;
}

function validateSeason(season) {
    return /^\d{4}[HU]$/.test(season);
}

async function main() {
    const { seasons, minMatches, hiddenOpExcludeRank } = parseArgs(process.argv.slice(2));
    const targetSeasons = seasons.length > 0 ? seasons : ['2025H', '2025U'];

    if (!targetSeasons.every(validateSeason)) {
        throw new Error(`Invalid season list: ${targetSeasons.join(', ')}`);
    }

    const repository = new StatsSeasonRepository(maria);

    for (const season of targetSeasons) {
        logger.info(`[rebuildSeasonStats] start ${season}`);
        await repository.deleteSeasonStats(season);
        await repository.insertSeasonSummary(season, minMatches, hiddenOpExcludeRank);
        await repository.insertSeasonCharacterStats(season);
        logger.info(`[rebuildSeasonStats] done ${season}`);
    }
}

main()
    .catch((err) => {
        logger.error(err);
        process.exitCode = 1;
    })
    .finally(async () => {
        try {
            await maria.getPool().end();
        } catch (err) {
            logger.error(err);
        }
    });
