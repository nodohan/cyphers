const repository = require('../repository/charCombiRepository');
const commonUtil = require('../util/commonUtil'); // 추정

class CharCombiStatsService {
    constructor() {
        this.combiRepository = new repository();
    }

    // 통계 계산 (주간/월간 기준 데이터 계산)
    callCombiData = async (statsDate) => {  
        const todayStr = commonUtil.getYYYYMMDD(statsDate, false);
        const aWeekAgo = commonUtil.getYYYYMMDD(commonUtil.addDays(statsDate, -7), false);
        const aMonthAgo = commonUtil.getYYYYMMDD(commonUtil.addDays(statsDate, -30), false);

        await this.combiRepository.calcCombiDate('weekly', aWeekAgo, todayStr);
        await this.combiRepository.calcCombiDate('monthly', aMonthAgo, todayStr);
    }

    // 상하위 20개 추출 및 저장
    callInsertStats = async (statsDate) => {
        const todayStr = commonUtil.getYYYYMMDD(statsDate, false);

        const jobs = [
            // 주간
            this.combiRepository.insertStats(todayStr, "weekly", "딜러", "DESC", "top"),
            this.combiRepository.insertStats(todayStr, "weekly", "딜러", "ASC", "bottom"),
            this.combiRepository.insertStats(todayStr, "weekly", "탱커", "DESC", "top"),
            this.combiRepository.insertStats(todayStr, "weekly", "탱커", "ASC", "bottom"),

            // 월간
            this.combiRepository.insertStats(todayStr, "monthly", "딜러", "DESC", "top"),
            this.combiRepository.insertStats(todayStr, "monthly", "딜러", "ASC", "bottom"),
            this.combiRepository.insertStats(todayStr, "monthly", "탱커", "DESC", "top"),
            this.combiRepository.insertStats(todayStr, "monthly", "탱커", "ASC", "bottom"),
        ];

        // 병렬 실행 (동시성 높이기)
        await Promise.all(jobs);
    }
}

module.exports = CharCombiStatsService;
