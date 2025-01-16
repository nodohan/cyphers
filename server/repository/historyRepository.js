class historyRepository {
    constructor(maria) {
        this.maria = maria;
    }

    insertAccessLog = async (ip, url) => {
        const pool = await this.maria.getPool();        
        const query = `insert into useHistory ( ip, url ) values ( '${ip}', '${url}' )`;

        return await pool.query(query);
    }
}

module.exports = historyRepository;