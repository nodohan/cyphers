const mariadb = require('promise-mysql');

class maria {
    constructor() {
        var POOL = null;

        this.createTcpPool = async(config) => {
            return await mariadb.createPool({
                host: '114.207.113.136',
                //host: 'localhost',
                port: 3306,
                user: 'nodo',
                password: 'P@ssw0rd',
                database: 'cyphers'
            });
        };

        this.createPool = async() => {
            const config = {
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
            };

            return await this.createTcpPool(config);
        };

        this.ensureSchema = async(pool) => {
            await pool.query(`SELECT 1;`);
        };

        this.createPoolAndEnsureSchema = async() =>
            await this.createPool()
            .then(async(pool) => {
                logger.debug("create pool");
                await this.ensureSchema(pool);
                POOL = pool;
                return pool;
            })
            .catch(err => {
                logger.error(err);
                throw err;
            });

        this.getPool = () => {
            return POOL || this.createPoolAndEnsureSchema(); 
        };
    }
}

module.exports = new maria();