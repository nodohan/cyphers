class historyRepository {
    constructor(maria) {
        this.maria = maria;
    }

    insertAccessLog = async (ip, url) => {
        const query = `insert into useHistory ( ip, url ) values ( ?, ? )`;
        return await this.maria.doQuery(query, [ip, url]);
    }
}

module.exports = historyRepository;