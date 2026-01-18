const RankChartService = require('../rankChartService');
const RankChartRepository = require('../../repository/rankChartRepository');
const logger = require('../../../config/winston');

// RankChartRepository 모듈을 모의(mock) 처리합니다.
jest.mock('../../repository/rankChartRepository');
// logger.error도 모의(mock) 처리하여 테스트 실행 중 콘솔에 에러가 출력되지 않도록 합니다.
jest.mock('../../../config/winston', () => ({
    error: jest.fn(),
}));

describe('RankChartService', () => {
    let rankChartService;
    const mockMaria = {}; // 서비스 생성자에 필요한 의존성

    // 각 테스트 전에 RankChartRepository의 모의 구현을 설정합니다.
    const mockFindChartDatesBySeason = jest.fn();
    const mockFindUserRank = jest.fn();

    beforeEach(() => {
        // 모든 모의(mock) 객체를 초기화합니다.
        RankChartRepository.mockClear();
        logger.error.mockClear();
        mockFindChartDatesBySeason.mockClear();
        mockFindUserRank.mockClear();

        RankChartRepository.mockImplementation(() => {
            return {
                findChartDatesBySeason: mockFindChartDatesBySeason,
                findUserRank: mockFindUserRank,
            };
        });

        // 새로운 서비스 인스턴스를 생성합니다.
        rankChartService = new RankChartService(mockMaria);
    });

    describe('getChartDates', () => {
        it('리포지토리에서 받은 날짜 목록을 올바른 형식으로 변환해야 합니다', async () => {
            const mockRepoResponse = [{ rankDateStr: '2024-01-01' }, { rankDateStr: '2024-01-02' }];
            mockFindChartDatesBySeason.mockResolvedValue(mockRepoResponse);
            
            const result = await rankChartService.getChartDates('season');
            
            expect(result).toEqual([['2024-01-01', 0], ['2024-01-02', 0]]);
            expect(mockFindChartDatesBySeason).toHaveBeenCalledWith('season');
            expect(mockFindChartDatesBySeason).toHaveBeenCalledTimes(1);
        });

        it('리포지토리가 null을 반환하면 null을 반환해야 합니다', async () => {
            mockFindChartDatesBySeason.mockResolvedValue(null);
            
            const result = await rankChartService.getChartDates('season');
            
            expect(result).toBeNull();
        });

        it('리포지토리에서 에러가 발생하면 null을 반환하고 에러를 로깅해야 합니다', async () => {
            const error = new Error('DB Error');
            mockFindChartDatesBySeason.mockRejectedValue(error);
            
            const result = await rankChartService.getChartDates('season');
            
            expect(result).toBeNull();
            expect(logger.error).toHaveBeenCalledWith(error);
            expect(logger.error).toHaveBeenCalledTimes(1);
        });
    });

    describe('getUserRank', () => {
        const nickname = 'testUser';
        const season = 'season';
        const dayType = 'all';

        it('리포지토리에서 받은 유저 랭크 목록을 올바른 형식으로 변환해야 합니다', async () => {
            const mockRepoResponse = [
                { rankDateStr: '2024-01-01', rankNumber: 100 },
                { rankDateStr: '2024-01-02', rankNumber: 105 }
            ];
            mockFindUserRank.mockResolvedValue(mockRepoResponse);

            const result = await rankChartService.getUserRank(nickname, season, dayType);

            expect(result).toEqual([['2024-01-01', 100], ['2024-01-02', 105]]);
            expect(mockFindUserRank).toHaveBeenCalledWith(nickname, season, dayType);
            expect(mockFindUserRank).toHaveBeenCalledTimes(1);
        });

        it('리포지토리가 null을 반환하면 null을 반환해야 합니다', async () => {
            mockFindUserRank.mockResolvedValue(null);

            const result = await rankChartService.getUserRank(nickname, season, dayType);

            expect(result).toBeNull();
        });

        it('리포지토리에서 에러가 발생하면 null을 반환하고 에러를 로깅해야 합니다', async () => {
            const error = new Error('DB Error');
            mockFindUserRank.mockRejectedValue(error);
            
            const result = await rankChartService.getUserRank(nickname, season, dayType);

            expect(result).toBeNull();
            expect(logger.error).toHaveBeenCalledWith(error);
            expect(logger.error).toHaveBeenCalledTimes(1);
        });
    });
});
