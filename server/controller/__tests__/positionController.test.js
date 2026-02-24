const express = require('express');
const supertest = require('supertest');
const positionController = require('../positionController');
// 테스트 과정에서 모의(mock) 처리할 리포지토리입니다.
const PositionRepository = require('../../repository/positionRepository');

// PositionRepository 모듈 전체를 모의(mock) 처리합니다.
jest.mock('../../repository/positionRepository');

describe('positionController', () => {
  let app;
  const mockSelect = jest.fn(); // 모의 함수를 더 넓은 범위에서 정의합니다.

  beforeEach(() => {
    // 각 테스트 전에 모의 객체를 초기화합니다.
    PositionRepository.mockClear();
    mockSelect.mockClear();

    // 리포지토리의 모의 구현을 제공합니다.
    PositionRepository.mockImplementation(() => {
      return {
        selectPositionAttrList: mockSelect
      };
    });

    // 테스트마다 새로운 express 앱을 설정합니다.
    app = express();
    const mockScheduler = {};
    const mockMaria = {}; 
    const mockAccLogger = () => (req, res, next) => {
        // res.render 함수를 모의(mock) 처리하여, 렌더링 대신 view 이름을 응답하도록 합니다.
        res.render = (view) => res.status(200).send(view);
        next();
    };

    // 컨트롤러는 라우터(router)를 반환하므로, 앱에 마운트합니다.
    const controllerRouter = positionController(mockScheduler, mockMaria, mockAccLogger);
    app.use('/', controllerRouter);
  });

  describe('GET /positionAttr', () => {
    it('should render the positionAttr view and return 200', async () => {
      // 실행
      const response = await supertest(app).get('/positionAttr');

      // 검증
      expect(response.status).toBe(200);
      expect(response.text).toBe('./pc/positionAttr');
    });
  });

  describe('GET /positionAttrList', () => {
    it('should fetch data from the repository and return it', async () => {
      // 준비
      const mockResult = [{ id: 1, name: 'Test Position' }];
      mockSelect.mockResolvedValue(mockResult); // 이 테스트 케이스에 대한 반환 값을 설정합니다.

      // 실행
      const response = await supertest(app).get('/positionAttrList');

      // 검증
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ rows: mockResult });
      expect(mockSelect).toHaveBeenCalledTimes(1);
    });
  });
});
