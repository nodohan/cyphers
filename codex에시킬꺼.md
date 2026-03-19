

# 시즌관련으로 작업중. 


• season_meta가 있다고 가정하고 메인 통계 쪽 연결은 끝냈습니다.

  적용한 내용은 이렇습니다.

  - 메인 최근 30일 집계는 matchDate >= current season.data_start_at 기준으로만 조회합니다.
  - 메인 캐릭터 승률은 char_season_stats에서 선택 날짜를 쓰되, 현재 시즌 시작일 이전 데이터는 막습니다.
  - 메인 최근 30일/금주 조합 통계는 배치 계산 시 주간/월간 시작일을 현재 시즌 시작 시각보다 앞으로 못 가게 잘랐습니다.
  - 캐릭터 시즌 누적 배치도 matches_map.matchDate >= current season.data_start_at 기준으로만 적재하게 바꿨습니다.
  - PC 메인 날짜 선택 최소값도 DB에서 읽은 시즌 시작일로 맞췄습니다.

  추가한 파일:

  - [seasonRepository.js](/D:/git/nodo/cyphers/server/repository/seasonRepository.js)

  수정한 파일:

  - [statsController.js](/D:/git/nodo/cyphers/server/controller/statsController.js)
  - [CharRatingStatsService.js](/D:/git/nodo/cyphers/server/service/CharRatingStatsService.js)
  - [CharCombiStatsService.js](/D:/git/nodo/cyphers/server/service/CharCombiStatsService.js)
  - [charRankingRepository.js](/D:/git/nodo/cyphers/server/repository/charRankingRepository.js)
  - [stats.ejs](/D:/git/nodo/cyphers/views/pc/stats.ejs)

  DB는 이걸로 가정했습니다.

  CREATE TABLE season_meta (
      season_code VARCHAR(16) NOT NULL PRIMARY KEY,
      data_start_at DATETIME NOT NULL,
      is_current CHAR(1) NOT NULL DEFAULT 'N',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT chk_season_meta_is_current CHECK (is_current IN ('Y', 'N'))
  );

  INSERT INTO season_meta (season_code, data_start_at, is_current)
  VALUES ('2026H', '2026-03-05 10:00:00', 'Y');

  기존 current를 내리고 바꾸는 쿼리는 이렇게 쓰면 됩니다.

  UPDATE season_meta
  SET is_current = 'N'
  WHERE is_current = 'Y';

  INSERT INTO season_meta (season_code, data_start_at, is_current)
  VALUES ('2026H', '2026-03-05 10:00:00', 'Y');

  주의할 점 하나만 있습니다.

  - 배치가 이미 이전 기준으로 쌓아둔 char_season_stats, char_combi_stats, char_combi_stats_ranked 데이터는 남아 있을 수
    있습니다. 새 기준으로 정확히 맞추려면 이 테이블들은 현재 시즌 기간분을 지우고 다시 적재하는 게 맞습니다.



# 2025U 시즌에 대한 통계를 다각도로 만들어보자. 

1️⃣ 캐릭 픽률 TOP20
2️⃣ 캐릭 승률 TOP20 (판수 필터)
3️⃣ 캐릭 판수 TOP20
4️⃣ 숨은 OP 캐릭
5️⃣ 함정 캐릭
6️⃣ 평균 게임 시간
7️⃣ 시즌 총 경기 수