const mariadb = require('mariadb');
const myConfig = require('./config.js');

class maria {
    constructor() {
        var POOL = null;

        this.createTcpPool = async(config) => {
            return await mariadb.createPool(myConfig.db);
        };

        this.createPool = async() => {
            return await this.createTcpPool();
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