// config로 스케쥴러 on/off db  주소 처리하는거 개발하고, 
// 시즌 변경됬으니까 조합 통계페이지 전시즌 포함/이번시즌만 선택 할 수 있는 것도 만들어야함.

module.exports = {
    db: {
        host: 'localhost',
        port: 3306,
        user: 'nodo',
        password: 'P@ssw0rd',
        database: 'cyphers'
        // [START cloud_sql_mysql_mysql_limit]
        // 'connectionLimit' is the maximum number of connections the pool is allowed to keep at once.
        connectionLimit: 50,
        // [END cloud_sql_mysql_mysql_limit]
        // [START cloud_sql_mysql_mysql_timeout]
        connectTimeout: 10000,
        acquireTimeout: 10000,
        waitForConnections: true,
        // 'queueLimit' is the maximum number of requests for connections the pool
        // will queue at once before returning an error. If 0, there is no limit.
        queueLimit: 0, // Default: 0
        // [END cloud_sql_mysql_mysql_timeout]
    },
    schedulerRun: false

}