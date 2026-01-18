const RankChartRepository = require('../rankChartRepository');
const logger = require('../../../config/winston');

// winston logger를 모의(mock) 처리합니다.
jest.mock('../../../config/winston', () => ({
    error: jest.fn(),
}));

describe('RankChartRepository', () => {
    let repository;
    let mockMaria;
    const mockDoQuery = jest.fn();

    beforeEach(() => {
        // 각 테스트 전에 모의(mock) 객체를 초기화합니다.
        mockDoQuery.mockClear();
        logger.error.mockClear();

        // 가짜 maria 객체를 설정합니다.
        mockMaria = {
            doQuery: mockDoQuery
        };
        
        // 가짜 maria 객체를 주입하여 리포지토리 인스턴스를 생성합니다.
        repository = new RankChartRepository(mockMaria);
    });

    describe('findChartDatesBySeason', () => {
        it('올바른 쿼리와 파라미터로 doQuery를 호출해야 합니다', async () => {
            const mockResponse = [{ rankDateStr: '01/18' }];
            mockDoQuery.mockResolvedValue(mockResponse);

            const result = await repository.findChartDatesBySeason('test-season');

            expect(mockDoQuery).toHaveBeenCalledTimes(1);
            // 쿼리 문자열의 공백과 개행을 정규화하여 비교합니다.
            const expectedQuery = `
                SELECT 
                    rankDate, DATE_FORMAT(rankDate,'%m/%e') rankDateStr, 0 rankNumber 
                FROM userRank 
                WHERE season = ?
                GROUP BY rankDate
                ORDER BY rankDate asc`;
            expect(mockDoQuery.mock.calls[0][0].replace(/\s+/g, ' ').trim()).toBe(expectedQuery.replace(/\s+/g, ' ').trim());
            expect(mockDoQuery.mock.calls[0][1]).toEqual(['test-season']);
            expect(result).toBe(mockResponse);
        });

        it('doQuery에서 에러가 발생하면 null을 반환하고 에러를 로깅해야 합니다', async () => {
            const error = new Error('DB Error');
            mockDoQuery.mockRejectedValue(error);

            const result = await repository.findChartDatesBySeason('test-season');

            expect(result).toBeNull();
            expect(logger.error).toHaveBeenCalledWith(error);
        });
    });

    describe('findUserRank', () => {
        it('dayType이 "full"일 때 올바른 쿼리를 생성해야 합니다', async () => {
            await repository.findUserRank('user', 'season', 'full');
            const query = mockDoQuery.mock.calls[0][0];
            expect(query).toContain("DATE_FORMAT(rankDate, '%Y-%m-%d')");
        });

        it('dayType이 "full"이 아닐 때 올바른 쿼리를 생성해야 합니다', async () => {
            await repository.findUserRank('user', 'season', 'short');
            const query = mockDoQuery.mock.calls[0][0];
            expect(query).toContain("DATE_FORMAT(rankDate, '%m/%e')");
        });

        it('doQuery에서 에러가 발생하면 null을 반환하고 에러를 로깅해야 합니다', async () => {
            const error = new Error('DB Error');
            mockDoQuery.mockRejectedValue(error);
            const result = await repository.findUserRank('user', 'season', 'full');
            expect(result).toBeNull();
            expect(logger.error).toHaveBeenCalledWith(error);
        });
    });
});
