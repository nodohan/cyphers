class SeasonRepository {
    constructor(maria) {
        this.maria = maria;
    }

    selectCurrentSeason = async () => {
        const query = `
            SELECT
                season_code,
                data_start_at,
                DATE_FORMAT(data_start_at, '%Y-%m-%d') AS data_start_date
            FROM season_meta
            WHERE is_current = 'Y'
            ORDER BY data_start_at DESC
            LIMIT 1
        `;

        const rows = await this.maria.doQuery(query);
        return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
    }
}

module.exports = SeasonRepository;
