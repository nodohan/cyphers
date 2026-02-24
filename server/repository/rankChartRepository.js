const logger = require('../../config/winston');

class RankChartRepository {
    constructor(maria) {
        this.maria = maria;
    }

    async findChartDatesBySeason(season = '2022H') {
        const query = `
            SELECT 
                rankDate, DATE_FORMAT(rankDate,'%m/%e') rankDateStr, 0 rankNumber 
            FROM userRank 
            WHERE season = ?
            GROUP BY rankDate
            ORDER BY rankDate asc`;
        try {
            return await this.maria.doQuery(query, [season]);
        } catch (err) {
            logger.error(err);
            return null;
        }
    }

    async findUserRank(userName, season, dayType) {
        // Safely determine the date format string to prevent injection issues.
        const dateFormat = dayType === "full" ? "%Y-%m-%d" : "%m/%e";

        // Note: The date format is intentionally part of the string as it's a format specifier, not a user value.
        // This is generally safe as we've controlled the possible values for dateFormat above.
        const query = `
            SELECT 
                DATE_FORMAT(rankDate, '${dateFormat}') rankDateStr, rankNumber, rankDate 
            FROM userRank 
            WHERE season = ?
            AND playerId = ( 
                SELECT 
                    playerId 
                FROM nickNames 
                WHERE nickname = ?
                ORDER BY checkingDate DESC LIMIT 1
            ) 
            ORDER BY rankDate asc`;
        try {
            // Passing user-provided values as parameters to the query.
            return await this.maria.doQuery(query, [season, userName]);
        } catch (err) {
            logger.error(err);
            return null;
        }
    }
}

module.exports = RankChartRepository;
