const repository = require('../repository/charRankingRepository.js');

const commonUtil = require('../util/commonUtil');

class CharRatingStatsService {

    constructor() {
        this.charRankingRepository = new repository();
    }

    charRanking = async () =>  {
        const yesterday = commonUtil.getYYYYMMDD(commonUtil.addDays(new Date(), -1), false);
        this.charRankingRepository.insertCharRanking(yesterday);
    }
}

module.exports = CharRatingStatsService;
