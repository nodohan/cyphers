class historyRepository {
    constructor(maria) {
        this.maria = maria;
    }

    insertAccessLog = async (ip, url, deviceType) => {
        const query = `insert into useHistory ( ip, url, url_path, device_type ) values ( ?, ?, ?, ? )`;
        return await this.maria.doQuery(query, [ip, url, url.split("\?")[0], deviceType]);
    }
}

module.exports = historyRepository;
