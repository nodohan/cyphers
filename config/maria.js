const mariadb = require('mariadb');
const myConfig = require('./config.js');

BigInt.prototype.toJSON = function() {
    return this.toLocaleString(); // 콤마 찍기
};

class Maria {
    constructor() {
        this.POOL = mariadb.createPool(myConfig.db);
    }

    async doQuery(query, params) {
        let conn;
        try {
            conn = await this.POOL.getConnection();
            const result = await conn.query(query, params);
            return result;
        } catch (err) {
            logger.error(err.message);
            return -1;
        } finally {
            if (conn) conn.release();
        }
    }

    getPool() {
        return this.POOL; // bulk insert, 트랜잭션 등에 직접 사용 가능
    }
}

module.exports = new Maria();