class historyRepository {
    constructor(maria) {
        this.maria = maria;
    }

    insertAccessLog = async (ip, url) => {
        const query = `insert into useHistory ( ip, url, url_path ) values ( ?, ?, ? )`;
        return await this.maria.doQuery(query, [ip, url, url.split("\?")[0]]);
    }
}

module.exports = historyRepository;