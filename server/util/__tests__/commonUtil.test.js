const commonUtil = require('../commonUtil');

describe('commonUtil', () => {
  describe('getYYYYMMDD', () => {
    // 테스트를 위해 고정된 UTC 날짜를 사용합니다.
    const testDate = new Date('2024-01-25T00:00:00.000Z');

    it('delHyphen이 true일 때 YYYYMMDD 형식으로 날짜를 반환해야 합니다', () => {
      // 함수 내부에서 9시간을 더하므로, KST 기준 '2024-01-25'가 됩니다.
      const expected = '20240125';
      const result = commonUtil.getYYYYMMDD(testDate, true);
      expect(result).toBe(expected);
    });

    it('delHyphen이 false일 때 YYYY-MM-DD 형식으로 날짜를 반환해야 합니다', () => {
      // 함수 내부에서 9시간을 더하므로, KST 기준 '2024-01-25'가 됩니다.
      const expected = '2024-01-25';
      const result = commonUtil.getYYYYMMDD(testDate, false);
      expect(result).toBe(expected);
    });
    
    it('기본적으로 YYYYMMDD 형식으로 날짜를 반환해야 합니다', () => {
      const expected = '20240125';
      const result = commonUtil.getYYYYMMDD(testDate);
      expect(result).toBe(expected);
    });
  });
});
