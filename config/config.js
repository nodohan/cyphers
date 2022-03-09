// config로 스케쥴러 on/off db  주소 처리하는거 개발하고, 
// 시즌 변경됬으니까 조합 통계페이지 전시즌 포함/이번시즌만 선택 할 수 있는 것도 만들어야함.

module.exports = {
    db: {
        host: '114.207.113.136',
        //host: 'localhost',
        port: 3306,
        user: 'nodo',
        password: 'P@ssw0rd',
        database: 'cyphers'
    },
    schedulerRun: false

}