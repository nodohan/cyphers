const service = require('../repository/charRankingRepository.js');
const commonUtil = require('../util/commonUtil');

class CharRatingStatsService {

    constructor() {
        
    }

    charRanking = async () =>  {

        const yesterday = commonUtil.getYYYYMMDD(commonUtil.addDays(new Date(), -1), false);
        
        const query = `
        INSERT INTO char_daily_stats (stat_date, char_name, total_matches, win_count, lose_count, rate)
        SELECT 
            DATE(matchDate) AS stat_date,
            charName,
            COUNT(*) AS total_matches,
            SUM(IF(result = 'win', 1, 0)) AS win_count,
            SUM(IF(result = 'lose', 1, 0)) AS lose_count,
            ROUND(SUM(IF(result = 'win', 1, 0)) / COUNT(*) * 100, 2) AS rate
        FROM matches_map
        where date(matchDate) = '${yesterday}'
        GROUP BY stat_date, charName`;
                       

    }
}

module.exports = CharRatingStatsService;
