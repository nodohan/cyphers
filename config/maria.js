const mariadb = require('mariadb');
const myConfig = require('./config.js');

// mariadb에서 bigNumberStrings가 정상적으로 안먹는것 같음. query option으로 줬는데도 안됨. 
BigInt.prototype.toJSON = function() {
    return this.toLocaleString();
}

class maria {
    constructor() {
        var POOL = null;

        this.createTcpPool = async() => {
            return await mariadb.createPool(myConfig.db);
        };

        this.createPool = async() => {
            return await this.createTcpPool();
        };

        this.ensureSchema = async(pool) => {
            try {
                await pool.query(`SELECT 1;`);
            } catch (err) {
                logger.error(err);
            }
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

        this.doQuery =  async(query) => {
            let pool = await this.getPool();
            let result = null;
            try {
                result = await pool.query(query);
            } catch (err) {
                result = -1;
                logger.error(err.message);
            }
            return result;
        }
    }
}

module.exports = new maria();