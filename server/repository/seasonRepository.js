class SeasonRepository {
    constructor(maria) {
        this.maria = maria;
    }

    selectCurrentSeason = async () => {
        const query = `
            SELECT
                season_code,
                season_start_at,
                season_end_at,
                DATE_FORMAT(season_start_at, '%Y-%m-%d') AS season_start_date,
                DATE_FORMAT(season_end_at, '%Y-%m-%d') AS season_end_date
            FROM season_meta
            WHERE is_current = 'Y'
            ORDER BY season_start_at DESC
            LIMIT 1
        `;

        const rows = await this.maria.doQuery(query);
        return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
    }
}

module.exports = SeasonRepository;
