const RankChartRepository = require('../repository/rankChartRepository');
const logger = require('../../config/winston');

class RankChartService {
    constructor(maria) {
        this.rankChartRepository = new RankChartRepository(maria);
    }

    async getChartDates(season) {
        try {
            const chartDateList = await this.rankChartRepository.findChartDatesBySeason(season);
            if (!chartDateList) {
                return null;
            }
            // The controller expects a specific array format.
            return chartDateList.map(row => [row.rankDateStr, 0]);
        } catch (err) {
            logger.error(err);
            return null;
        }
    }

    async getUserRank(nickname, season, dayType) {
        try {
            const userRankList = await this.rankChartRepository.findUserRank(nickname, season, dayType);
            if (!userRankList) {
                return null;
            }
            // The controller expects a specific array format.
            return userRankList.map(row => [row.rankDateStr, row.rankNumber]);
        } catch (err) {
            logger.error(err);
            return null;
        }
    }
}

module.exports = RankChartService;
