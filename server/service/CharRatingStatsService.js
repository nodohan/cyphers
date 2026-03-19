const repository = require('../repository/charRankingRepository.js');
const SeasonRepository = require('../repository/seasonRepository');

const commonUtil = require('../util/commonUtil');

class CharRatingStatsService {

    constructor(maria) {
        this.charRankingRepository = new repository(maria);
        this.seasonRepository = new SeasonRepository(maria);
    }

    charRanking = async () =>  {
        const yesterday = commonUtil.getYYYYMMDD(commonUtil.addDays(new Date(), -1), false);
        const currentSeason = await this.seasonRepository.selectCurrentSeason();

        if (!currentSeason) {
            throw new Error('Current season metadata not found');
        }

        await this.charRankingRepository.insertSeasonCharRanking(yesterday, currentSeason.season_start_at);
        await this.charRankingRepository.updateMatchesMapRating(yesterday);
    }

    searchRankingForRating = async (type, minNum, maxNum) => {
        return await this.charRankingRepository.selectCharRankForRating(type, minNum, maxNum);
    }

    getLatestUserRanking = async () => {
        return await this.charRankingRepository.selectLatestRanking();
    }

}

module.exports = CharRatingStatsService;
