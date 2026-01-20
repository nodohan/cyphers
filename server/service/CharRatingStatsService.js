const repository = require('../repository/charRankingRepository.js');

const commonUtil = require('../util/commonUtil');

class CharRatingStatsService {

    constructor(maria) {
        this.charRankingRepository = new repository(maria);
    }

    charRanking = async () =>  {
        const yesterday = commonUtil.getYYYYMMDD(commonUtil.addDays(new Date(), -1), false);
        this.charRankingRepository.insertSeasonCharRanking(yesterday);
        this.charRankingRepository.updateMatchesMapRating(yesterday);
    }

    searchRankingForRating = async (type, minNum, maxNum) => {
        return await this.charRankingRepository.selectCharRankForRating(type, minNum, maxNum);
    }

}

module.exports = CharRatingStatsService;
