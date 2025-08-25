const repository = require('../repository/charRankingRepository.js');

const commonUtil = require('../util/commonUtil');

class CharRatingStatsService {

    constructor() {
        this.charRankingRepository = new repository();
    }

    charRanking = async () =>  {
        const yesterday = commonUtil.getYYYYMMDD(commonUtil.addDays(new Date(), -1), false);
        this.charRankingRepository.insertCharRanking(yesterday);
        this.charRankingRepository.updateMatchesMapRating(yesterday);
    }

    searchRankingForRating = async (delPosition, minRP, maxRP) => {
        this.charRankingRepository.selectCharRankForRating(delPosition, minRP, maxRP);
    }

}

module.exports = CharRatingStatsService;
